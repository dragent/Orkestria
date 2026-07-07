<?php

declare(strict_types=1);

namespace App\Controller;

use App\Repository\DocumentRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/documents', name: 'api_documents_')]
#[IsGranted('ROLE_ADMIN')]
final class DocumentClassificationController extends AbstractController
{
    public function __construct(
        private readonly DocumentRepository $documentRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly SerializerInterface $serializer,
    ) {}

    #[Route('/{id}/classification', name: 'update_classification', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function updateClassification(int $id, Request $request): JsonResponse
    {
        $document = $this->documentRepository->find($id);
        if ($document === null) {
            return $this->json(['message' => 'Document not found.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Invalid JSON.'], Response::HTTP_BAD_REQUEST);
        }

        if (array_key_exists('classificationLabel', $data)) {
            $label = trim((string) $data['classificationLabel']);
            $document->setClassificationLabel($label !== '' ? $label : null);
        }

        if (array_key_exists('classificationStatus', $data)) {
            $status = (string) $data['classificationStatus'];
            if (!in_array($status, ['pending', 'done', 'error'], true)) {
                return $this->json(['message' => 'Invalid classificationStatus.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $document->setClassificationStatus($status);
        }

        $this->entityManager->flush();

        $json = $this->serializer->serialize($document, 'json', ['groups' => ['document:read']]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }
}
