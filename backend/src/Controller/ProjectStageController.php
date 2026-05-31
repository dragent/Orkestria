<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\ProjectPipelineStage;
use App\Entity\ProjectStageHistory;
use App\Entity\User;
use App\Repository\ProjectRepository;
use App\Repository\ProjectStageHistoryRepository;
use App\Service\NotificationService;
use App\Service\StageChecklistService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

/**
 * Handles sequential project stage advancement with role-based access control.
 *
 * Rules:
 *  - Stages progress strictly in order (no skipping, no going back through this endpoint).
 *  - Each stage has a minimum required role to advance FROM it.
 *  - ROLE_ADMIN (which inherits all other roles) can always advance.
 */
#[Route('/api/projects/{id}/stage', name: 'api_project_stage_', requirements: ['id' => '\d+'])]
#[IsGranted('ROLE_USER')]
final class ProjectStageController extends AbstractController
{
    /**
     * Maps "current stage value" → roles authorised to advance FROM it.
     * ROLE_ADMIN is always allowed (role hierarchy includes all internal roles).
     *
     * @var array<string, list<string>>
     */
    private const TRANSITION_ROLES = [
        'contact'            => ['ROLE_ADMIN'],
        'meeting'            => ['ROLE_ADMIN'],
        'engineer_assigned'  => ['ROLE_ADMIN', 'ROLE_ENGINEER'],
        'quote_plan'         => ['ROLE_ADMIN', 'ROLE_ENGINEER'],
        'quote_signed'       => ['ROLE_ADMIN'],
        'invoice_sent'       => ['ROLE_ADMIN', 'ROLE_RH'],
        'deposit_received'   => ['ROLE_ADMIN', 'ROLE_ENGINEER'],
        'design_started'     => ['ROLE_ADMIN', 'ROLE_ENGINEER'],
        'design_completed'   => ['ROLE_ADMIN'],
        'client_signed'      => ['ROLE_ADMIN', 'ROLE_ENGINEER'],
        'components_ordered' => ['ROLE_ADMIN', 'ROLE_ENGINEER'],
        'construction'       => ['ROLE_ADMIN'],
        'subcontractors'     => ['ROLE_ADMIN', 'ROLE_ENGINEER'],
        'site_visit'         => ['ROLE_ADMIN', 'ROLE_RH'],
        // 'paid' is terminal — no entry means no transition allowed
    ];

    private const HISTORY_GROUPS = ['project_stage_history:read', 'user:read'];

    public function __construct(
        private readonly ProjectRepository $projectRepository,
        private readonly ProjectStageHistoryRepository $historyRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly SerializerInterface $serializer,
        private readonly NotificationService $notificationService,
        private readonly StageChecklistService $checklistService,
    ) {}

    /** POST /api/projects/{id}/stage/advance — advance to the next stage */
    #[Route('/advance', name: 'advance', methods: ['POST'])]
    public function advance(int $id, Request $request): JsonResponse
    {
        $project = $this->projectRepository->find($id);
        if ($project === null) {
            return $this->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }

        $currentStage = $project->getPipelineStage();

        if ($currentStage->isTerminal()) {
            return $this->json(
                ['message' => 'Project is already at the final stage.'],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $allowedRoles = self::TRANSITION_ROLES[$currentStage->value] ?? [];
        if (!$this->isGrantedAny($allowedRoles)) {
            return $this->json(
                [
                    'message'      => 'You do not have permission to advance this stage.',
                    'currentStage' => $currentStage->value,
                    'requiredRoles' => $allowedRoles,
                ],
                Response::HTTP_FORBIDDEN
            );
        }

        $nextStage = $currentStage->next();
        if ($nextStage === null) {
            return $this->json(
                ['message' => 'No next stage available.'],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        /** @var User|null $user */
        $user = $this->getUser();
        $actor = $user instanceof User ? $user : null;

        // Optional note from JSON body
        $body = json_decode($request->getContent(), true);
        $note = is_array($body) && isset($body['note']) && is_string($body['note'])
            ? trim($body['note'])
            : null;
        if ($note === '') {
            $note = null;
        }

        $history = new ProjectStageHistory($project, $currentStage, $nextStage, $actor, $note);

        $project->setPipelineStage($nextStage);

        $this->entityManager->persist($history);
        $this->entityManager->flush();

        try {
            $this->notificationService->sendStageAdvancedNotification($project, $currentStage, $nextStage, $actor, $note);
        } catch (\Throwable) {
            // Mail failure must not block the response
        }

        return $this->json([
            'stage'          => $nextStage->value,
            'stageChangedAt' => $project->getStageChangedAt()?->format(\DateTimeInterface::ATOM),
            'isTerminal'     => $nextStage->isTerminal(),
        ]);
    }

    /** GET /api/projects/{id}/stage/checklist — return checklist for current stage */
    #[Route('/checklist', name: 'checklist', methods: ['GET'])]
    public function checklist(int $id): JsonResponse
    {
        $project = $this->projectRepository->find($id);
        if ($project === null) {
            return $this->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }

        $items = $this->checklistService->getChecklist($project);

        return $this->json([
            'stage' => $project->getPipelineStage()->value,
            'items' => $items,
        ]);
    }

    /** GET /api/projects/{id}/stage/history — return stage transition history */
    #[Route('/history', name: 'history', methods: ['GET'])]
    public function history(int $id): JsonResponse
    {
        $project = $this->projectRepository->find($id);
        if ($project === null) {
            return $this->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }

        $entries = $this->historyRepository->findByProject($project);
        $json = $this->serializer->serialize($entries, 'json', ['groups' => self::HISTORY_GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    /**
     * @param list<string> $roles
     */
    private function isGrantedAny(array $roles): bool
    {
        foreach ($roles as $role) {
            if ($this->isGranted($role)) {
                return true;
            }
        }

        return false;
    }
}
