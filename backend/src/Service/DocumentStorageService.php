<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Project;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\File\UploadedFile;

final class DocumentStorageService
{
    public function __construct(
        #[Autowire('%app.uploads_dir%')]
        private readonly string $uploadsDir,
    ) {}

    /**
     * @return array{0: string, 1: string} [relativePath, clientMimeOrGuess]
     */
    public function store(UploadedFile $file, Project $project): array
    {
        $projectDir = $this->uploadsDir . '/documents/project_' . $project->getId();
        if (!is_dir($projectDir) && !mkdir($projectDir, 0775, true) && !is_dir($projectDir)) {
            throw new \RuntimeException(sprintf('Cannot create directory "%s".', $projectDir));
        }

        $original = $file->getClientOriginalName();
        $safeBase = preg_replace('/[^a-zA-Z0-9._-]+/', '_', $original) ?? 'file';
        $unique = bin2hex(random_bytes(8)) . '_' . $safeBase;
        $mime = $file->getClientMimeType() ?? 'application/octet-stream';
        $file->move($projectDir, $unique);

        $relative = 'documents/project_' . $project->getId() . '/' . $unique;

        return [$relative, $mime];
    }

    public function absolutePath(string $relativePath): string
    {
        return $this->uploadsDir . '/' . $relativePath;
    }
}
