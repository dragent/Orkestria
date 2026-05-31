<?php

declare(strict_types=1);

namespace App\Controller;

use App\Repository\EmployeeRepository;
use App\Repository\ProjectRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/projects/{projectId}/employees', name: 'api_project_employees_', requirements: ['projectId' => '\d+'])]
#[IsGranted('ROLE_ADMIN')]
final class ProjectEmployeeController extends AbstractController
{
    public function __construct(
        private readonly ProjectRepository $projectRepository,
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

        $json = $this->serializer->serialize(
            $project->getEmployees()->toArray(),
            'json',
            ['groups' => ['employee:read']]
        );

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('', name: 'assign', methods: ['POST'])]
    public function assign(int $projectId, Request $request): JsonResponse
    {
        $project = $this->projectRepository->find($projectId);
        if ($project === null) {
            return $this->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        $employeeId = $data['employeeId'] ?? null;
        if (!is_int($employeeId) && !(is_string($employeeId) && ctype_digit((string) $employeeId))) {
            return $this->json(['message' => 'Field "employeeId" is required.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $employee = $this->employeeRepository->find((int) $employeeId);
        if ($employee === null) {
            return $this->json(['message' => 'Employee not found.'], Response::HTTP_NOT_FOUND);
        }

        $project->addEmployee($employee);
        $this->entityManager->flush();

        return $this->json(['message' => 'Employee assigned.'], Response::HTTP_OK);
    }

    #[Route('/{employeeId}', name: 'remove', methods: ['DELETE'], requirements: ['employeeId' => '\d+'])]
    public function remove(int $projectId, int $employeeId): Response
    {
        $project = $this->projectRepository->find($projectId);
        if ($project === null) {
            return $this->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }

        $employee = $this->employeeRepository->find($employeeId);
        if ($employee === null) {
            return $this->json(['message' => 'Employee not found.'], Response::HTTP_NOT_FOUND);
        }

        $project->removeEmployee($employee);
        $this->entityManager->flush();

        return new Response(null, Response::HTTP_NO_CONTENT);
    }
}
