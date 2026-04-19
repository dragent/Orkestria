<?php

declare(strict_types=1);

namespace App\Controller;

use App\Repository\DocumentRepository;
use App\Security\Voter\DocumentVoter;
use App\Service\DocumentStorageService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/documents/{id}/download', name: 'api_document_download', methods: ['GET'], requirements: ['id' => '\d+'])]
#[IsGranted('ROLE_USER')]
final class DocumentDownloadController extends AbstractController
{
    public function __construct(
        private readonly DocumentRepository $documentRepository,
        private readonly DocumentStorageService $documentStorage,
    ) {}

    public function __invoke(int $id): Response
    {
        $document = $this->documentRepository->find($id);
        if ($document === null) {
            return $this->json(['message' => 'Document not found.'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(DocumentVoter::VIEW, $document);

        $path = $this->documentStorage->absolutePath($document->getFilePath());
        if (!is_file($path)) {
            return $this->json(['message' => 'File missing on server.'], Response::HTTP_NOT_FOUND);
        }

        $response = new BinaryFileResponse($path);
        $response->headers->set('Content-Type', $document->getType() ?: 'application/octet-stream');
        $response->setContentDisposition(ResponseHeaderBag::DISPOSITION_ATTACHMENT, $document->getName());

        return $response;
    }
}
