<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Project;
use App\Entity\ProjectPipelineStage;
use App\Repository\ClientRepository;
use App\Repository\ProjectRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/projects', name: 'api_projects_')]
#[IsGranted('ROLE_ADMIN')]
final class ProjectController extends AbstractController
{
    private const SERIALIZATION_GROUPS = ['project:read', 'client:read', 'company:read'];

    public function __construct(
        private readonly ProjectRepository $projectRepository,
        private readonly ClientRepository $clientRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly SerializerInterface $serializer,
        private readonly ValidatorInterface $validator,
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $q = $request->query->get('q');
        $q = is_string($q) ? trim($q) : null;
        if ($q === '') {
            $q = null;
        }

        $pipelineParam = $request->query->get('pipeline');
        $pipeline = null;
        if (is_string($pipelineParam) && $pipelineParam !== '') {
            try {
                $pipeline = ProjectPipelineStage::from($pipelineParam);
            } catch (\ValueError) {
                return $this->json([
                    'message' => 'Invalid pipeline value.',
                    'allowed' => array_map(static fn (ProjectPipelineStage $s) => $s->value, ProjectPipelineStage::cases()),
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $clientIdParam = $request->query->get('clientId');
        $clientId = null;
        if ($clientIdParam !== null && $clientIdParam !== '') {
            if (!ctype_digit((string) $clientIdParam)) {
                return $this->json(['message' => 'Invalid clientId.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $clientId = (int) $clientIdParam;
        }

        $projects = $this->projectRepository->search($q, $pipeline, $clientId);
        $json = $this->serializer->serialize($projects, 'json', ['groups' => self::SERIALIZATION_GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        $project = $this->projectRepository->find($id);
        if ($project === null) {
            return $this->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }

        $json = $this->serializer->serialize($project, 'json', ['groups' => self::SERIALIZATION_GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Invalid JSON payload.'], Response::HTTP_BAD_REQUEST);
        }

        $title = trim((string) ($data['title'] ?? ''));
        $clientId = $data['clientId'] ?? null;

        if ($title === '') {
            return $this->json(['message' => 'Field "title" is required.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (!is_int($clientId) && !(is_string($clientId) && ctype_digit((string) $clientId))) {
            return $this->json(['message' => 'Field "clientId" must be an integer.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $client = $this->clientRepository->find((int) $clientId);
        if ($client === null) {
            return $this->json(['message' => 'Client not found.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $project = new Project();
        $project->setTitle($title);
        $project->setClient($client);

        $stageError = $this->applyPipelineStage($project, $data['pipelineStage'] ?? null, required: false);
        if ($stageError !== null) {
            return $stageError;
        }

        $dateError = $this->applyDates($project, $data);
        if ($dateError !== null) {
            return $dateError;
        }

        $violations = $this->validator->validate($project);
        if (\count($violations) > 0) {
            return $this->validationErrorResponse($violations);
        }

        $this->entityManager->persist($project);
        $this->entityManager->flush();

        $json = $this->serializer->serialize($project, 'json', ['groups' => self::SERIALIZATION_GROUPS]);

        return new JsonResponse($json, Response::HTTP_CREATED, [], true);
    }

    #[Route('/{id}', name: 'update', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $project = $this->projectRepository->find($id);
        if ($project === null) {
            return $this->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Invalid JSON payload.'], Response::HTTP_BAD_REQUEST);
        }

        if (array_key_exists('title', $data)) {
            $title = trim((string) $data['title']);
            if ($title === '') {
                return $this->json(['message' => 'Field "title" cannot be empty.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $project->setTitle($title);
        }

        if (array_key_exists('clientId', $data)) {
            $clientId = $data['clientId'];
            if (!is_int($clientId) && !(is_string($clientId) && ctype_digit((string) $clientId))) {
                return $this->json(['message' => 'Field "clientId" must be an integer.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $client = $this->clientRepository->find((int) $clientId);
            if ($client === null) {
                return $this->json(['message' => 'Client not found.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $project->setClient($client);
        }

        $stageError = $this->applyPipelineStage($project, $data['pipelineStage'] ?? null, required: false);
        if ($stageError !== null) {
            return $stageError;
        }

        $dateError = $this->applyDates($project, $data);
        if ($dateError !== null) {
            return $dateError;
        }

        $violations = $this->validator->validate($project);
        if (\count($violations) > 0) {
            return $this->validationErrorResponse($violations);
        }

        $this->entityManager->flush();

        $json = $this->serializer->serialize($project, 'json', ['groups' => self::SERIALIZATION_GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): Response
    {
        $project = $this->projectRepository->find($id);
        if ($project === null) {
            return $this->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($project);
        $this->entityManager->flush();

        return new Response(null, Response::HTTP_NO_CONTENT);
    }

    private function applyPipelineStage(Project $project, mixed $raw, bool $required): ?JsonResponse
    {
        if ($raw === null) {
            return $required
                ? $this->json(['message' => 'Field "pipelineStage" is required.'], Response::HTTP_UNPROCESSABLE_ENTITY)
                : null;
        }

        if (!is_string($raw)) {
            return $this->json(['message' => 'Field "pipelineStage" must be a string.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $project->setPipelineStage(ProjectPipelineStage::from($raw));
        } catch (\ValueError) {
            return $this->json([
                'message' => 'Invalid pipelineStage.',
                'allowed' => array_map(static fn (ProjectPipelineStage $s) => $s->value, ProjectPipelineStage::cases()),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return null;
    }

    /**
     * @param array<string, mixed> $data
     */
    private function applyDates(Project $project, array $data): ?JsonResponse
    {
        if (array_key_exists('startDate', $data)) {
            $parsed = $this->parseOptionalDate($data['startDate']);
            if ($parsed === false) {
                return $this->json(['message' => 'Invalid startDate (use ISO 8601).'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $project->setStartDate($parsed);
        }

        if (array_key_exists('endDate', $data)) {
            $parsed = $this->parseOptionalDate($data['endDate']);
            if ($parsed === false) {
                return $this->json(['message' => 'Invalid endDate (use ISO 8601).'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $project->setEndDate($parsed);
        }

        return null;
    }

    /**
     * @return \DateTimeImmutable|null|false null if JSON null, false if invalid
     */
    private function parseOptionalDate(mixed $raw): \DateTimeImmutable|null|false
    {
        if ($raw === null) {
            return null;
        }

        if (!is_string($raw) || $raw === '') {
            return false;
        }

        try {
            return new \DateTimeImmutable($raw);
        } catch (\Exception) {
            return false;
        }
    }

    private function validationErrorResponse(iterable $violations): JsonResponse
    {
        $errors = [];
        foreach ($violations as $violation) {
            $errors[$violation->getPropertyPath()] = $violation->getMessage();
        }

        return $this->json(['message' => 'Validation failed.', 'errors' => $errors], Response::HTTP_UNPROCESSABLE_ENTITY);
    }
}
