<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\ProjectRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ProjectRepository::class)]
class Project
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['project:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Groups(['project:read'])]
    private string $title;

    #[ORM\Column(length: 32, enumType: ProjectPipelineStage::class)]
    #[Groups(['project:read'])]
    private ProjectPipelineStage $pipelineStage = ProjectPipelineStage::LEAD;

    #[ORM\ManyToOne(inversedBy: 'projects')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['project:read'])]
    private ?Client $client = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['project:read'])]
    private ?\DateTimeImmutable $startDate = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['project:read'])]
    private ?\DateTimeImmutable $endDate = null;

    #[ORM\Column]
    #[Groups(['project:read'])]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getPipelineStage(): ProjectPipelineStage
    {
        return $this->pipelineStage;
    }

    public function setPipelineStage(ProjectPipelineStage $pipelineStage): static
    {
        $this->pipelineStage = $pipelineStage;

        return $this;
    }

    public function getClient(): ?Client
    {
        return $this->client;
    }

    public function setClient(?Client $client): static
    {
        $this->client = $client;

        return $this;
    }

    public function getStartDate(): ?\DateTimeImmutable
    {
        return $this->startDate;
    }

    public function setStartDate(?\DateTimeImmutable $startDate): static
    {
        $this->startDate = $startDate;

        return $this;
    }

    public function getEndDate(): ?\DateTimeImmutable
    {
        return $this->endDate;
    }

    public function setEndDate(?\DateTimeImmutable $endDate): static
    {
        $this->endDate = $endDate;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }
}
