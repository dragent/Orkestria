<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Leave;
use App\Entity\LeaveStatus;
use App\Entity\LeaveType;
use App\Entity\User;
use App\Repository\EmployeeRepository;
use App\Repository\LeaveRepository;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/admin/leaves', name: 'api_admin_leaves_')]
#[IsGranted('ROLE_RH')]
final class LeaveController extends AbstractController
{
    private const GROUPS = ['leave:read'];

    public function __construct(
        private readonly LeaveRepository $leaveRepository,
        private readonly EmployeeRepository $employeeRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly SerializerInterface $serializer,
        private readonly NotificationService $notificationService,
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $employeeId = $this->parseIntParam($request, 'employeeId');
        $companyId  = $this->parseIntParam($request, 'companyId');

        $status = null;
        if ($request->query->has('status')) {
            try {
                $status = LeaveStatus::from((string) $request->query->get('status'));
            } catch (\ValueError) {
                return $this->json(['message' => 'Invalid status value.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $type = null;
        if ($request->query->has('type')) {
            try {
                $type = LeaveType::from((string) $request->query->get('type'));
            } catch (\ValueError) {
                return $this->json(['message' => 'Invalid type value.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $page    = max(1, (int) ($request->query->get('page', '1') ?? '1'));
        $perPage = max(0, (int) ($request->query->get('perPage', '50') ?? '50'));

        $result  = $this->leaveRepository->findFiltered($employeeId, $companyId, $status, $type, $page, $perPage);
        $json    = $this->serializer->serialize($result['items'], 'json', ['groups' => self::GROUPS]);
        $headers = [
            'X-Total-Count' => (string) $result['total'],
            'X-Page'        => (string) $page,
            'X-Per-Page'    => (string) $perPage,
        ];

        return new JsonResponse($json, Response::HTTP_OK, $headers, true);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Invalid JSON.'], Response::HTTP_BAD_REQUEST);
        }

        $leave = new Leave();
        $err   = $this->hydrate($leave, $data, true);
        if ($err !== null) {
            return $err;
        }

        if ($this->leaveRepository->hasOverlap(
            $leave->getEmployee()->getId(),
            $leave->getStartsAt(),
            $leave->getEndsAt(),
        )) {
            return $this->json(['message' => 'This employee already has an active leave overlapping these dates.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $this->entityManager->persist($leave);
        $this->entityManager->flush();

        $json = $this->serializer->serialize($leave, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_CREATED, [], true);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        $leave = $this->leaveRepository->find($id);
        if ($leave === null) {
            return $this->json(['message' => 'Not found.'], Response::HTTP_NOT_FOUND);
        }

        $json = $this->serializer->serialize($leave, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/{id}', name: 'update', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $leave = $this->leaveRepository->find($id);
        if ($leave === null) {
            return $this->json(['message' => 'Not found.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Invalid JSON.'], Response::HTTP_BAD_REQUEST);
        }

        $err = $this->hydrate($leave, $data, false);
        if ($err !== null) {
            return $err;
        }

        if (array_key_exists('startsAt', $data) || array_key_exists('endsAt', $data)) {
            if ($this->leaveRepository->hasOverlap(
                $leave->getEmployee()->getId(),
                $leave->getStartsAt(),
                $leave->getEndsAt(),
                $leave->getId(),
            )) {
                return $this->json(['message' => 'This employee already has an active leave overlapping these dates.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $this->entityManager->flush();

        $json = $this->serializer->serialize($leave, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/{id}/approve', name: 'approve', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function approve(int $id): JsonResponse
    {
        $leave = $this->leaveRepository->find($id);
        if ($leave === null) {
            return $this->json(['message' => 'Not found.'], Response::HTTP_NOT_FOUND);
        }

        $leave->setStatus(LeaveStatus::APPROVED);
        $approver = $this->getUser();
        if ($approver instanceof User) {
            $leave->setApprovedBy($approver);
        }
        $leave->setApprovedAt(new \DateTimeImmutable());

        $this->entityManager->flush();

        try {
            $this->notificationService->sendLeaveStatusNotification($leave);
        } catch (\Throwable) {
            // Notification failure must not block the response
        }

        $json = $this->serializer->serialize($leave, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/{id}/reject', name: 'reject', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function reject(int $id): JsonResponse
    {
        $leave = $this->leaveRepository->find($id);
        if ($leave === null) {
            return $this->json(['message' => 'Not found.'], Response::HTTP_NOT_FOUND);
        }

        $leave->setStatus(LeaveStatus::REJECTED);
        $approver = $this->getUser();
        if ($approver instanceof User) {
            $leave->setApprovedBy($approver);
        }
        $leave->setApprovedAt(new \DateTimeImmutable());

        $this->entityManager->flush();

        try {
            $this->notificationService->sendLeaveStatusNotification($leave);
        } catch (\Throwable) {
            // Notification failure must not block the response
        }

        $json = $this->serializer->serialize($leave, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): Response
    {
        $leave = $this->leaveRepository->find($id);
        if ($leave === null) {
            return $this->json(['message' => 'Not found.'], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($leave);
        $this->entityManager->flush();

        return new Response(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * @param array<string, mixed> $data
     */
    private function hydrate(Leave $leave, array $data, bool $create): ?JsonResponse
    {
        if ($create || array_key_exists('employeeId', $data)) {
            $eId = $data['employeeId'] ?? null;
            if (!is_int($eId) && !(is_string($eId) && ctype_digit((string) $eId))) {
                return $this->json(['message' => 'Field "employeeId" is required.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $employee = $this->employeeRepository->find((int) $eId);
            if ($employee === null) {
                return $this->json(['message' => 'Employee not found.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $leave->setEmployee($employee);
        }

        if ($create || array_key_exists('type', $data)) {
            $raw = $data['type'] ?? null;
            if (!is_string($raw)) {
                return $this->json(['message' => 'Field "type" is required.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            try {
                $leave->setType(LeaveType::from($raw));
            } catch (\ValueError) {
                return $this->json(['message' => 'Invalid type.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        if ($create || array_key_exists('startsAt', $data)) {
            $raw = $data['startsAt'] ?? null;
            if (!is_string($raw) || $raw === '') {
                return $this->json(['message' => 'Field "startsAt" is required (ISO date).'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            try {
                $leave->setStartsAt(new \DateTimeImmutable($raw));
            } catch (\Exception) {
                return $this->json(['message' => 'Invalid startsAt.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        if ($create || array_key_exists('endsAt', $data)) {
            $raw = $data['endsAt'] ?? null;
            if (!is_string($raw) || $raw === '') {
                return $this->json(['message' => 'Field "endsAt" is required (ISO date).'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            try {
                $leave->setEndsAt(new \DateTimeImmutable($raw));
            } catch (\Exception) {
                return $this->json(['message' => 'Invalid endsAt.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        if (array_key_exists('reason', $data)) {
            $reason = $data['reason'];
            $leave->setReason(is_string($reason) && $reason !== '' ? $reason : null);
        }

        if (array_key_exists('status', $data)) {
            $raw = $data['status'];
            if (!is_string($raw)) {
                return $this->json(['message' => 'Invalid status.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            try {
                $leave->setStatus(LeaveStatus::from($raw));
            } catch (\ValueError) {
                return $this->json(['message' => 'Invalid status value.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        return null;
    }

    private function parseIntParam(Request $request, string $key): ?int
    {
        $p = $request->query->get($key);
        if ($p !== null && $p !== '' && ctype_digit((string) $p)) {
            return (int) $p;
        }

        return null;
    }
}
