<?php

declare(strict_types=1);

namespace App\Message;

final readonly class ClassifyDocumentMessage
{
    public function __construct(public readonly int $documentId) {}
}
