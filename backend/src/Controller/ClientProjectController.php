<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use App\Repository\ProjectRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/client/projects', name: 'api_client_projects_')]
#[IsGranted('ROLE_CLIENT')]
final class ClientProjectController extends AbstractController
{
    private const GROUPS = ['project:read', 'client:read', 'company:read'];

    public function __construct(
        private readonly ProjectRepository $projectRepository,
        private readonly SerializerInterface $serializer,
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $projects = $this->projectRepository->findByClientEmail($user->getEmail());
        $json = $this->serializer->serialize($projects, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $project = $this->projectRepository->find($id);
        if ($project === null) {
            return $this->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }
        $client = $project->getClient();
        if ($client === null || $client->getEmail() !== $user->getEmail()) {
            return $this->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        $json = $this->serializer->serialize($project, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }
}