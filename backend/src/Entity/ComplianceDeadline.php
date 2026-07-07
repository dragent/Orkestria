<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\ComplianceDeadlineRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ComplianceDeadlineRepository::class)]
class ComplianceDeadline
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['compliance_deadline:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['compliance_deadline:read'])]
    private ?Company $company = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[Groups(['compliance_deadline:read'])]
    private ?Employee $employee = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[Groups(['compliance_deadline:read'])]
    private ?Project $project = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Groups(['compliance_deadline:read'])]
    private string $title;

    #[ORM\Column(length: 32, enumType: ComplianceDeadlineCategory::class)]
    #[Groups(['compliance_deadline:read'])]
    private ComplianceDeadlineCategory $category = ComplianceDeadlineCategory::OTHER;

    #[ORM\Column(type: 'date_immutable')]
    #[Groups(['compliance_deadline:read'])]
    private \DateTimeImmutable $expiresAt;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['compliance_deadline:read'])]
    private ?string $notes = null;

    #[ORM\Column]
    #[Groups(['compliance_deadline:read'])]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCompany(): ?Company
    {
        return $this->company;
    }

    public function setCompany(?Company $company): static
    {
        $this->company = $company;

        return $this;
    }

    public function getEmployee(): ?Employee
    {
        return $this->employee;
    }

    public function setEmployee(?Employee $employee): static
    {
        $this->employee = $employee;

        return $this;
    }

    public function getProject(): ?Project
    {
        return $this->project;
    }

    public function setProject(?Project $project): static
    {
        $this->project = $project;

        return $this;
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

    public function getCategory(): ComplianceDeadlineCategory
    {
        return $this->category;
    }

    public function setCategory(ComplianceDeadlineCategory $category): static
    {
        $this->category = $category;

        return $this;
    }

    public function getExpiresAt(): \DateTimeImmutable
    {
        return $this->expiresAt;
    }

    public function setExpiresAt(\DateTimeImmutable $expiresAt): static
    {
        $this->expiresAt = $expiresAt;

        return $this;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): static
    {
        $this->notes = $notes;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }
}
