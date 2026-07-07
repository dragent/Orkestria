<?php

declare(strict_types=1);

namespace App\MessageHandler;

use App\Message\ClassifyDocumentMessage;
use App\Repository\DocumentRepository;
use App\Service\DocumentClassifierService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
final class ClassifyDocumentMessageHandler
{
    public function __construct(
        private readonly DocumentRepository $documentRepository,
        private readonly DocumentClassifierService $classifier,
        private readonly EntityManagerInterface $entityManager,
    ) {}

    public function __invoke(ClassifyDocumentMessage $message): void
    {
        $document = $this->documentRepository->find($message->documentId);
        if ($document === null) {
            return;
        }

        try {
            $result = $this->classifier->classify($document->getName(), $document->getType());
            $document->setClassificationStatus('done');
            $document->setClassificationLabel($result['label']);
        } catch (\Throwable) {
            $document->setClassificationStatus('error');
        }

        $this->entityManager->flush();
    }
}
