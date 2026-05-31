<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\TimeEntry;
use App\Entity\TimeEntryHourType;
use App\Entity\User;
use App\Repository\EmployeeRepository;
use App\Repository\ProjectRepository;
use App\Repository\TimeEntryRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/projects/{projectId}/time-entries', name: 'api_time_entries_', requirements: ['projectId' => '\d+'])]
#[IsGranted('ROLE_USER')]
final class TimeEntryController extends AbstractController
{
    private const GROUPS = ['time_entry:read', 'employee:read'];

    public function __construct(
        private readonly ProjectRepository $projectRepository,
        private readonly EmployeeRepository $employeeRepository,
        private readonly TimeEntryRepository $timeEntryRepository,
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

        $entries = $this->timeEntryRepository->findByProject($project);
        $json = $this->serializer->serialize($entries, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(int $projectId, Request $request): JsonResponse
    {
        $project = $this->projectRepository->find($projectId);
        if ($project === null) {
            return $this->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }

        /** @var User $user */
        $user = $this->getUser();
        $isAdmin = \in_array('ROLE_ADMIN', $user->getRoles(), true);

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Invalid JSON.'], Response::HTTP_BAD_REQUEST);
        }

        $employeeId = $data['employeeId'] ?? null;
        if (!is_int($employeeId) && !(is_string($employeeId) && ctype_digit((string) $employeeId))) {
            return $this->json(['message' => 'Field "employeeId" is required.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $employee = $this->employeeRepository->find((int) $employeeId);
        if ($employee === null) {
            return $this->json(['message' => 'Employee not found.'], Response::HTTP_NOT_FOUND);
        }

        if (!$isAdmin && ($employee->getUser() === null || $employee->getUser()->getId() !== $user->getId())) {
            return $this->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        $hours = $data['hours'] ?? null;
        if (!is_numeric($hours) || (float) $hours <= 0) {
            return $this->json(['message' => 'Field "hours" must be a positive number.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $dateRaw = $data['date'] ?? null;
        if (!is_string($dateRaw) || $dateRaw === '') {
            return $this->json(['message' => 'Field "date" is required (ISO date).'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $date = new \DateTimeImmutable($dateRaw);
        } catch (\Exception) {
            return $this->json(['message' => 'Invalid date format.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $hourType = TimeEntryHourType::REGULAR;
        if (isset($data['hourType']) && is_string($data['hourType']) && $data['hourType'] !== '') {
            try {
                $hourType = TimeEntryHourType::from($data['hourType']);
            } catch (\ValueError) {
                return $this->json(['message' => 'Invalid hourType.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $entry = new TimeEntry();
        $entry->setEmployee($employee);
        $entry->setProject($project);
        $entry->setHours((string) $hours);
        $entry->setDate($date);
        $entry->setHourType($hourType);
        $entry->setDescription(isset($data['description']) && $data['description'] !== '' ? (string) $data['description'] : null);

        $this->entityManager->persist($entry);
        $this->entityManager->flush();

        $json = $this->serializer->serialize($entry, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_CREATED, [], true);
    }

    #[Route('/{entryId}', name: 'delete', methods: ['DELETE'], requirements: ['entryId' => '\d+'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(int $projectId, int $entryId): Response
    {
        $entry = $this->timeEntryRepository->find($entryId);
        if ($entry === null || $entry->getProject()?->getId() !== $projectId) {
            return $this->json(['message' => 'Time entry not found.'], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($entry);
        $this->entityManager->flush();

        return new Response(null, Response::HTTP_NO_CONTENT);
    }
}
