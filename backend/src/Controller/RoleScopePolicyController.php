<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\DocumentScope;
use App\Entity\RoleScopePolicy;
use App\Repository\RoleScopePolicyRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin/role-scope-policies', name: 'api_admin_role_scope_policies_')]
#[IsGranted('ROLE_ADMIN')]
final class RoleScopePolicyController extends AbstractController
{
    private const ALLOWED_ROLES = [
        'ROLE_ADMIN',
        'ROLE_RH',
        'ROLE_ENGINEER',
        'ROLE_DEVELOPER',
        'ROLE_WORKFORCE',
        'ROLE_SUBCONTRACTOR_PATRON',
        'ROLE_SUBCONTRACTOR_RH',
        'ROLE_SUBCONTRACTOR_WORKFORCE',
        'ROLE_CLIENT',
    ];

    public function __construct(
        private readonly RoleScopePolicyRepository $repository,
        private readonly EntityManagerInterface $entityManager,
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $allowedScopes = array_map(static fn (DocumentScope $s) => $s->value, DocumentScope::cases());
        $policies = $this->repository->findAllIndexedByRole();

        $result = [];
        foreach (self::ALLOWED_ROLES as $role) {
            $result[] = [
                'role' => $role,
                'documentScopes' => $policies[$role]?->getDocumentScopes() ?? [],
                'allowedScopes' => $allowedScopes,
            ];
        }

        return $this->json($result);
    }

    #[Route('', name: 'batch_update', methods: ['PUT'])]
    public function batchUpdate(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return $this->json(['message' => 'Invalid JSON payload.'], Response::HTTP_BAD_REQUEST);
        }

        $allowedScopes = array_map(static fn (DocumentScope $s) => $s->value, DocumentScope::cases());
        $existing = $this->repository->findAllIndexedByRole();

        foreach ($data as $entry) {
            if (!is_array($entry) || !isset($entry['role'], $entry['documentScopes'])) {
                return $this->json(['message' => 'Each entry must have "role" and "documentScopes".'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $role = (string) $entry['role'];
            if (!\in_array($role, self::ALLOWED_ROLES, true)) {
                return $this->json(['message' => 'Unknown role: ' . $role], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            if (!is_array($entry['documentScopes'])) {
                return $this->json(['message' => 'Field "documentScopes" must be an array.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $normalized = [];
            foreach ($entry['documentScopes'] as $scope) {
                if (!is_string($scope)) {
                    return $this->json(['message' => 'Each scope must be a string.'], Response::HTTP_UNPROCESSABLE_ENTITY);
                }
                try {
                    $normalized[] = DocumentScope::from($scope)->value;
                } catch (\ValueError) {
                    return $this->json([
                        'message' => 'Invalid document scope: ' . $scope,
                        'allowed' => $allowedScopes,
                    ], Response::HTTP_UNPROCESSABLE_ENTITY);
                }
            }

            if (isset($existing[$role])) {
                $existing[$role]->setDocumentScopes($normalized);
            } else {
                $policy = new RoleScopePolicy($role);
                $policy->setDocumentScopes($normalized);
                $this->entityManager->persist($policy);
            }
        }

        $this->entityManager->flush();

        return $this->list();
    }
}
