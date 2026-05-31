<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use App\Repository\EmployeeRepository;
use App\Repository\ProjectRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/subcontractor', name: 'api_subcontractor_')]
#[IsGranted('ROLE_USER')]
final class SubcontractorProjectController extends AbstractController
{
    private const GROUPS = ['project:read', 'client:read', 'company:read'];

    public function __construct(
        private readonly EmployeeRepository $employeeRepository,
        private readonly ProjectRepository $projectRepository,
        private readonly SerializerInterface $serializer,
    ) {}

    #[Route('/projects', name: 'projects', methods: ['GET'])]
    public function projects(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $employee = $this->employeeRepository->findByUser($user);

        if ($employee === null) {
            return new JsonResponse([], Response::HTTP_OK);
        }

        $projects = $employee->getProjects()->toArray();
        $json = $this->serializer->serialize($projects, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/projects/{id}', name: 'project_show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $employee = $this->employeeRepository->findByUser($user);

        $project = $this->projectRepository->find($id);
        if ($project === null) {
            return $this->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }

        $isAdmin = \in_array('ROLE_ADMIN', $user->getRoles(), true);
        if (!$isAdmin) {
            if ($employee === null || !$employee->getProjects()->contains($project)) {
                return $this->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
            }
        }

        $json = $this->serializer->serialize($project, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }
}
