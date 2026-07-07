<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Ticket;
use App\Entity\TicketComment;
use App\Entity\TicketPriority;
use App\Entity\TicketSource;
use App\Entity\TicketStatus;
use App\Entity\TicketType;
use App\Entity\User;
use App\Repository\EmployeeRepository;
use App\Repository\ProjectRepository;
use App\Repository\TicketCommentRepository;
use App\Repository\TicketRepository;
use App\Security\Voter\TicketVoter;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/tickets', name: 'api_tickets_')]
#[IsGranted('ROLE_USER')]
final class TicketController extends AbstractController
{
    private const TICKET_GROUPS = ['ticket:read', 'employee:read', 'user:read', 'project:read'];
    private const COMMENT_GROUPS = ['ticket_comment:read', 'user:read'];

    public function __construct(
        private readonly TicketRepository $ticketRepository,
        private readonly TicketCommentRepository $commentRepository,
        private readonly ProjectRepository $projectRepository,
        private readonly EmployeeRepository $employeeRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly SerializerInterface $serializer,
        private readonly NotificationService $notificationService,
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $roles = $user->getRoles();
        $isAdmin = \in_array('ROLE_ADMIN', $roles, true);
        $isDeveloper = \in_array('ROLE_DEVELOPER', $roles, true);

        $criteria = [
            'status' => $this->parseEnum($request->query->get('status'), TicketStatus::class),
            'priority' => $this->parseEnum($request->query->get('priority'), TicketPriority::class),
            'type' => $this->parseEnum($request->query->get('type'), TicketType::class),
            'source' => $this->parseEnum($request->query->get('source'), TicketSource::class),
            'projectId' => $this->parseInt($request->query->get('projectId')),
            'assigneeId' => $this->parseInt($request->query->get('assigneeId')),
            'q' => $request->query->get('q'),
        ];

        if (!$isAdmin && !$isDeveloper) {
            $criteria['reporterId'] = $user->getId();
        }

        $page    = max(1, (int) ($request->query->get('page', '1') ?? '1'));
        $perPage = max(0, (int) ($request->query->get('perPage', '50') ?? '50'));

        $result  = $this->ticketRepository->findFiltered($criteria, $page, $perPage);
        $json    = $this->serializer->serialize($result['items'], 'json', ['groups' => self::TICKET_GROUPS]);
        $headers = [
            'X-Total-Count' => (string) $result['total'],
            'X-Page'        => (string) $page,
            'X-Per-Page'    => (string) $perPage,
        ];

        return new JsonResponse($json, Response::HTTP_OK, $headers, true);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        $ticket = $this->ticketRepository->find($id);
        if ($ticket === null) {
            return $this->json(['message' => 'Ticket not found.'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(TicketVoter::VIEW, $ticket);

        $json = $this->serializer->serialize($ticket, 'json', ['groups' => self::TICKET_GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    #[IsGranted('ROLE_DEVELOPER')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Invalid JSON.'], Response::HTTP_BAD_REQUEST);
        }

        $title = trim((string) ($data['title'] ?? ''));
        $description = trim((string) ($data['description'] ?? ''));
        if ($title === '' || $description === '') {
            return $this->json(['message' => 'Fields "title" and "description" are required.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $ticket = new Ticket();
        $ticket->setTitle($title);
        $ticket->setDescription($description);
        $ticket->setSource(TicketSource::INTERNAL);

        /** @var User $user */
        $user = $this->getUser();
        $ticket->setReporter($user);

        if (($error = $this->applyEnumIfPresent($data, 'type', TicketType::class, [$ticket, 'setType'])) !== null) {
            return $error;
        }
        if (($error = $this->applyEnumIfPresent($data, 'priority', TicketPriority::class, [$ticket, 'setPriority'])) !== null) {
            return $error;
        }
        if (($error = $this->applyEnumIfPresent($data, 'status', TicketStatus::class, [$ticket, 'setStatus'])) !== null) {
            return $error;
        }

        if (array_key_exists('projectId', $data) && $data['projectId'] !== null) {
            $project = $this->projectRepository->find((int) $data['projectId']);
            if ($project === null) {
                return $this->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
            }
            $ticket->setProject($project);
        }

        if (array_key_exists('assigneeId', $data) && $data['assigneeId'] !== null) {
            $employee = $this->employeeRepository->find((int) $data['assigneeId']);
            if ($employee === null) {
                return $this->json(['message' => 'Employee not found.'], Response::HTTP_NOT_FOUND);
            }
            $ticket->setAssignee($employee);
        }

        $this->entityManager->persist($ticket);
        $this->entityManager->flush();

        if ($ticket->getAssignee() !== null) {
            try {
                $this->notificationService->sendTicketAssignedNotification($ticket);
            } catch (\Throwable) {
                // Mail failure must not block the response
            }
        }

        $json = $this->serializer->serialize($ticket, 'json', ['groups' => self::TICKET_GROUPS]);

        return new JsonResponse($json, Response::HTTP_CREATED, [], true);
    }

    #[Route('/{id}', name: 'update', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $ticket = $this->ticketRepository->find($id);
        if ($ticket === null) {
            return $this->json(['message' => 'Ticket not found.'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(TicketVoter::EDIT, $ticket);

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Invalid JSON.'], Response::HTTP_BAD_REQUEST);
        }

        /** @var User $user */
        $user = $this->getUser();
        $roles = $user->getRoles();
        $isStaff = \in_array('ROLE_ADMIN', $roles, true) || \in_array('ROLE_DEVELOPER', $roles, true);
        $assigneeChanged = false;

        if (array_key_exists('title', $data) && $isStaff) {
            $title = trim((string) $data['title']);
            if ($title === '') {
                return $this->json(['message' => 'Field "title" cannot be empty.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $ticket->setTitle($title);
        }

        if (array_key_exists('description', $data)) {
            $description = trim((string) $data['description']);
            if ($description === '') {
                return $this->json(['message' => 'Field "description" cannot be empty.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $ticket->setDescription($description);
        }

        if (($error = $this->applyEnumIfPresent($data, 'status', TicketStatus::class, [$ticket, 'setStatus'])) !== null) {
            return $error;
        }
        if ($isStaff) {
            if (($error = $this->applyEnumIfPresent($data, 'priority', TicketPriority::class, [$ticket, 'setPriority'])) !== null) {
                return $error;
            }
            if (($error = $this->applyEnumIfPresent($data, 'type', TicketType::class, [$ticket, 'setType'])) !== null) {
                return $error;
            }

            if (array_key_exists('assigneeId', $data)) {
                $previousAssigneeId = $ticket->getAssignee()?->getId();
                if ($data['assigneeId'] === null) {
                    $ticket->setAssignee(null);
                } else {
                    $employee = $this->employeeRepository->find((int) $data['assigneeId']);
                    if ($employee === null) {
                        return $this->json(['message' => 'Employee not found.'], Response::HTTP_NOT_FOUND);
                    }
                    $ticket->setAssignee($employee);
                }
                $newAssigneeId = $ticket->getAssignee()?->getId();
                $assigneeChanged = $newAssigneeId !== null && $newAssigneeId !== $previousAssigneeId;
            }

            if (array_key_exists('projectId', $data)) {
                if ($data['projectId'] === null) {
                    $ticket->setProject(null);
                } else {
                    $project = $this->projectRepository->find((int) $data['projectId']);
                    if ($project === null) {
                        return $this->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
                    }
                    $ticket->setProject($project);
                }
            }
        }

        $ticket->touch();
        $this->entityManager->flush();

        if ($assigneeChanged ?? false) {
            try {
                $this->notificationService->sendTicketAssignedNotification($ticket);
            } catch (\Throwable) {
                // Mail failure must not block the response
            }
        }

        $json = $this->serializer->serialize($ticket, 'json', ['groups' => self::TICKET_GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): Response
    {
        $ticket = $this->ticketRepository->find($id);
        if ($ticket === null) {
            return $this->json(['message' => 'Ticket not found.'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(TicketVoter::DELETE, $ticket);

        $this->entityManager->remove($ticket);
        $this->entityManager->flush();

        return new Response(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('/{id}/comments', name: 'comments_list', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function listComments(int $id): JsonResponse
    {
        $ticket = $this->ticketRepository->find($id);
        if ($ticket === null) {
            return $this->json(['message' => 'Ticket not found.'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(TicketVoter::VIEW, $ticket);

        $comments = $this->commentRepository->findByTicket($ticket);
        $json = $this->serializer->serialize($comments, 'json', ['groups' => self::COMMENT_GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/{id}/comments', name: 'comments_create', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function addComment(int $id, Request $request): JsonResponse
    {
        $ticket = $this->ticketRepository->find($id);
        if ($ticket === null) {
            return $this->json(['message' => 'Ticket not found.'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(TicketVoter::COMMENT, $ticket);

        $data = json_decode($request->getContent(), true);
        $body = is_array($data) ? trim((string) ($data['body'] ?? '')) : '';
        if ($body === '') {
            return $this->json(['message' => 'Field "body" is required.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        /** @var User $user */
        $user = $this->getUser();

        $comment = new TicketComment();
        $comment->setTicket($ticket);
        $comment->setAuthor($user);
        $comment->setBody($body);

        // SLA: record first response if commenter is staff (not the reporter)
        $isStaffComment = $ticket->getReporter() === null || $ticket->getReporter()->getId() !== $user->getId();
        if ($isStaffComment && $ticket->getFirstResponseAt() === null) {
            $ticket->setFirstResponseAt(new \DateTimeImmutable());
        }

        $ticket->touch();

        $this->entityManager->persist($comment);
        $this->entityManager->flush();

        $json = $this->serializer->serialize($comment, 'json', ['groups' => self::COMMENT_GROUPS]);

        return new JsonResponse($json, Response::HTTP_CREATED, [], true);
    }

    /**
     * @template T of \BackedEnum
     *
     * @param class-string<T> $enumClass
     */
    private function parseEnum(?string $value, string $enumClass): ?\BackedEnum
    {
        if ($value === null || $value === '') {
            return null;
        }
        try {
            /** @var \BackedEnum $enum */
            $enum = $enumClass::from($value);

            return $enum;
        } catch (\ValueError) {
            return null;
        }
    }

    private function parseInt(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        return is_numeric($value) ? (int) $value : null;
    }

    /**
     * @template T of \BackedEnum
     *
     * @param array<string, mixed> $data
     * @param class-string<T> $enumClass
     * @param callable(T): mixed $setter
     */
    private function applyEnumIfPresent(array $data, string $key, string $enumClass, callable $setter): ?JsonResponse
    {
        if (!array_key_exists($key, $data)) {
            return null;
        }

        try {
            /** @var T $enum */
            $enum = $enumClass::from((string) $data[$key]);
        } catch (\ValueError) {
            return $this->json([
                'message' => sprintf('Invalid %s.', $key),
                'allowed' => array_map(fn (\BackedEnum $e) => $e->value, $enumClass::cases()),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $setter($enum);

        return null;
    }
}
