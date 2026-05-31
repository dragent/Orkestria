<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Ticket;
use App\Entity\TicketPriority;
use App\Entity\TicketSource;
use App\Entity\TicketType;
use App\Entity\User;
use App\Repository\ProjectRepository;
use App\Repository\TicketRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/client/projects/{projectId}/tickets', name: 'api_client_tickets_', requirements: ['projectId' => '\d+'])]
#[IsGranted('ROLE_CLIENT')]
final class ClientTicketController extends AbstractController
{
    private const GROUPS = ['ticket:read', 'project:read', 'user:read'];

    public function __construct(
        private readonly ProjectRepository $projectRepository,
        private readonly TicketRepository $ticketRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly SerializerInterface $serializer,
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(int $projectId): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $project = $this->projectRepository->find($projectId);
        if ($project === null) {
            return $this->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }
        if (!$this->isClientProject($user, $project)) {
            return $this->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        $tickets = $this->ticketRepository->findFiltered([
            'projectId' => $projectId,
            'reporterId' => $user->getId(),
            'source' => TicketSource::CLIENT,
        ]);

        $json = $this->serializer->serialize($tickets, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(int $projectId, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $project = $this->projectRepository->find($projectId);
        if ($project === null) {
            return $this->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }
        if (!$this->isClientProject($user, $project)) {
            return $this->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

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
        $ticket->setProject($project);
        $ticket->setReporter($user);
        $ticket->setSource(TicketSource::CLIENT);

        $type = TicketType::SUPPORT;
        if (isset($data['type'])) {
            try {
                $candidate = TicketType::from((string) $data['type']);
                if (\in_array($candidate, [TicketType::SUPPORT, TicketType::BUG], true)) {
                    $type = $candidate;
                }
            } catch (\ValueError) {
                return $this->json([
                    'message' => 'Invalid type.',
                    'allowed' => [TicketType::SUPPORT->value, TicketType::BUG->value],
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }
        $ticket->setType($type);

        if (isset($data['priority'])) {
            try {
                $ticket->setPriority(TicketPriority::from((string) $data['priority']));
            } catch (\ValueError) {
                return $this->json([
                    'message' => 'Invalid priority.',
                    'allowed' => array_map(fn (TicketPriority $p) => $p->value, TicketPriority::cases()),
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $this->entityManager->persist($ticket);
        $this->entityManager->flush();

        $json = $this->serializer->serialize($ticket, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_CREATED, [], true);
    }

    private function isClientProject(User $user, \App\Entity\Project $project): bool
    {
        $client = $project->getClient();

        return $client !== null && $client->getEmail() === $user->getEmail();
    }
}
