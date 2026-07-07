<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Task;
use App\Entity\TaskStatus;
use App\Entity\User;
use App\Repository\EmployeeRepository;
use App\Repository\ProjectRepository;
use App\Repository\TaskRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/projects/{projectId}/tasks', name: 'api_tasks_', requirements: ['projectId' => '\d+'])]
#[IsGranted('ROLE_USER')]
final class TaskController extends AbstractController
{
    private const GROUPS = ['task:read', 'employee:read'];

    public function __construct(
        private readonly ProjectRepository $projectRepository,
        private readonly TaskRepository $taskRepository,
        private readonly EmployeeRepository $employeeRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly SerializerInterface $serializer,
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(int $projectId): JsonResponse
    {
        $project = $this->projectRepository->find($projectId);
        if ($project === null) {
            return $this->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }

        /** @var User $user */
        $user = $this->getUser();

        if (!\in_array('ROLE_ADMIN', $user->getRoles(), true)) {
            $isAssigned = $this->isUserAssignedToProject($user, $project->getId());
            if (!$isAssigned) {
                return $this->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
            }
        }

        $tasks = $this->taskRepository->findByProject($project);
        $json = $this->serializer->serialize($tasks, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function create(int $projectId, Request $request): JsonResponse
    {
        $project = $this->projectRepository->find($projectId);
        if ($project === null) {
            return $this->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Invalid JSON.'], Response::HTTP_BAD_REQUEST);
        }

        $title = trim((string) ($data['title'] ?? ''));
        if ($title === '') {
            return $this->json(['message' => 'Field "title" is required.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $task = new Task();
        $task->setTitle($title);
        $task->setProject($project);
        $task->setDescription(isset($data['description']) ? (string) $data['description'] : null);

        if (isset($data['status'])) {
            try {
                $task->setStatus(TaskStatus::from((string) $data['status']));
            } catch (\ValueError) {
                return $this->json([
                    'message' => 'Invalid status.',
                    'allowed' => array_map(fn (TaskStatus $s) => $s->value, TaskStatus::cases()),
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        if (isset($data['dueDate'])) {
            try {
                $task->setDueDate(new \DateTimeImmutable((string) $data['dueDate']));
            } catch (\Exception) {
                return $this->json(['message' => 'Invalid dueDate.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        if (array_key_exists('assigneeId', $data)) {
            if ($data['assigneeId'] !== null) {
                $employee = $this->employeeRepository->find((int) $data['assigneeId']);
                if ($employee === null) {
                    return $this->json(['message' => 'Employee not found.'], Response::HTTP_NOT_FOUND);
                }
                $task->setAssignee($employee);
            }
        }

        $this->entityManager->persist($task);
        $this->entityManager->flush();

        $json = $this->serializer->serialize($task, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_CREATED, [], true);
    }

    #[Route('/{taskId}', name: 'update', methods: ['PATCH'], requirements: ['taskId' => '\d+'])]
    public function update(int $projectId, int $taskId, Request $request): JsonResponse
    {
        $project = $this->projectRepository->find($projectId);
        if ($project === null) {
            return $this->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }

        $task = $this->taskRepository->find($taskId);
        if ($task === null || $task->getProject()?->getId() !== $projectId) {
            return $this->json(['message' => 'Task not found.'], Response::HTTP_NOT_FOUND);
        }

        /** @var User $user */
        $user = $this->getUser();
        $isAdmin = \in_array('ROLE_ADMIN', $user->getRoles(), true);

        if (!$isAdmin) {
            $isAssigned = $this->isUserAssignedToProject($user, $projectId);
            if (!$isAssigned) {
                return $this->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
            }
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Invalid JSON.'], Response::HTTP_BAD_REQUEST);
        }

        if (array_key_exists('title', $data) && $isAdmin) {
            $title = trim((string) $data['title']);
            if ($title === '') {
                return $this->json(['message' => 'Field "title" cannot be empty.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $task->setTitle($title);
        }

        if (array_key_exists('description', $data) && $isAdmin) {
            $task->setDescription($data['description'] !== null ? (string) $data['description'] : null);
        }

        if (array_key_exists('status', $data)) {
            try {
                $task->setStatus(TaskStatus::from((string) $data['status']));
            } catch (\ValueError) {
                return $this->json([
                    'message' => 'Invalid status.',
                    'allowed' => array_map(fn (TaskStatus $s) => $s->value, TaskStatus::cases()),
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        if (array_key_exists('dueDate', $data) && $isAdmin) {
            if ($data['dueDate'] === null) {
                $task->setDueDate(null);
            } else {
                try {
                    $task->setDueDate(new \DateTimeImmutable((string) $data['dueDate']));
                } catch (\Exception) {
                    return $this->json(['message' => 'Invalid dueDate.'], Response::HTTP_UNPROCESSABLE_ENTITY);
                }
            }
        }

        if (array_key_exists('assigneeId', $data) && $isAdmin) {
            if ($data['assigneeId'] === null) {
                $task->setAssignee(null);
            } else {
                $employee = $this->employeeRepository->find((int) $data['assigneeId']);
                if ($employee === null) {
                    return $this->json(['message' => 'Employee not found.'], Response::HTTP_NOT_FOUND);
                }
                $task->setAssignee($employee);
            }
        }

        $this->entityManager->flush();
        $json = $this->serializer->serialize($task, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/{taskId}', name: 'delete', methods: ['DELETE'], requirements: ['taskId' => '\d+'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(int $projectId, int $taskId): Response
    {
        $task = $this->taskRepository->find($taskId);
        if ($task === null || $task->getProject()?->getId() !== $projectId) {
            return $this->json(['message' => 'Task not found.'], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($task);
        $this->entityManager->flush();

        return new Response(null, Response::HTTP_NO_CONTENT);
    }

    private function isUserAssignedToProject(User $user, int $projectId): bool
    {
        $project = $this->projectRepository->find($projectId);
        if ($project === null) {
            return false;
        }
        foreach ($project->getEmployees() as $emp) {
            if ($emp->getUser() !== null && $emp->getUser()->getId() === $user->getId()) {
                return true;
            }
        }

        return false;
    }
}
