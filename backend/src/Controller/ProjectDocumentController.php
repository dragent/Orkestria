<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\DocumentScope;
use App\Entity\User;
use App\Repository\DocumentRepository;
use App\Repository\ProjectRepository;
use App\Service\DocumentStorageService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/projects/{projectId}/documents', name: 'api_project_documents_')]
#[IsGranted('ROLE_USER')]
final class ProjectDocumentController extends AbstractController
{
    public function __construct(
        private readonly ProjectRepository $projectRepository,
        private readonly DocumentRepository $documentRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly DocumentStorageService $documentStorage,
        private readonly SerializerInterface $serializer,
    ) {}

    #[Route('', name: 'list', methods: ['GET'], requirements: ['projectId' => '\d+'])]
    public function list(int $projectId, Request $request): JsonResponse
    {
        $project = $this->projectRepository->find($projectId);
        if ($project === null) {
            return $this->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }

        /** @var User $user */
        $user = $this->getUser();

        $scopeFilter = null;
        $rawScope = $request->query->get('scope');
        if (is_string($rawScope) && $rawScope !== '') {
            try {
                $scopeFilter = DocumentScope::from($rawScope);
            } catch (\ValueError) {
                return $this->json(['message' => 'Invalid scope filter.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            if (!\in_array('ROLE_ADMIN', $user->getRoles(), true)
                && !\in_array($scopeFilter->value, $user->getDocumentScopes(), true)) {
                return $this->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
            }
        }

        $documents = $this->documentRepository->findForProjectAndUser($project, $user, $scopeFilter);
        $json = $this->serializer->serialize($documents, 'json', ['groups' => ['document:read']]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('', name: 'upload', methods: ['POST'], requirements: ['projectId' => '\d+'])]
    #[IsGranted('ROLE_ADMIN')]
    public function upload(int $projectId, Request $request): JsonResponse
    {
        $project = $this->projectRepository->find($projectId);
        if ($project === null) {
            return $this->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }

        $file = $request->files->get('file');
        if (!$file instanceof UploadedFile || !$file->isValid()) {
            return $this->json(['message' => 'A valid "file" is required.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $scopeRaw = $request->request->get('scope');
        if (!is_string($scopeRaw) || $scopeRaw === '') {
            return $this->json(['message' => 'Field "scope" is required.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $scope = DocumentScope::from($scopeRaw);
        } catch (\ValueError) {
            return $this->json([
                'message' => 'Invalid scope.',
                'allowed' => array_map(static fn (DocumentScope $s) => $s->value, DocumentScope::cases()),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $name = $request->request->get('name');
        $displayName = is_string($name) && $name !== '' ? $name : $file->getClientOriginalName();

        [$relative, $mime] = $this->documentStorage->store($file, $project);

        $document = new Document();
        $document->setName($displayName);
        $document->setType($mime);
        $document->setFilePath($relative);
        $document->setScope($scope);
        $document->setProject($project);

        $this->entityManager->persist($document);
        $this->entityManager->flush();

        $json = $this->serializer->serialize($document, 'json', ['groups' => ['document:read']]);

        return new JsonResponse($json, Response::HTTP_CREATED, [], true);
    }
}
