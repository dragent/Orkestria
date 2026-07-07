<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\ProjectStageHistoryRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: ProjectStageHistoryRepository::class)]
#[ORM\Table(name: 'project_stage_history')]
class ProjectStageHistory
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['project_stage_history:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Project::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Project $project;

    #[ORM\Column(length: 32, enumType: ProjectPipelineStage::class)]
    #[Groups(['project_stage_history:read'])]
    private ProjectPipelineStage $fromStage;

    #[ORM\Column(length: 32, enumType: ProjectPipelineStage::class)]
    #[Groups(['project_stage_history:read'])]
    private ProjectPipelineStage $toStage;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[Groups(['project_stage_history:read', 'user:read'])]
    private ?User $changedBy = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['project_stage_history:read'])]
    private ?string $note = null;

    #[ORM\Column]
    #[Groups(['project_stage_history:read'])]
    private \DateTimeImmutable $changedAt;

    public function __construct(
        Project $project,
        ProjectPipelineStage $fromStage,
        ProjectPipelineStage $toStage,
        ?User $changedBy,
        ?string $note = null,
    ) {
        $this->project   = $project;
        $this->fromStage = $fromStage;
        $this->toStage   = $toStage;
        $this->changedBy = $changedBy;
        $this->note      = $note;
        $this->changedAt = new \DateTimeImmutable();
    }

    public function getNote(): ?string { return $this->note; }

    public function getId(): ?int { return $this->id; }

    public function getProject(): Project { return $this->project; }

    public function getFromStage(): ProjectPipelineStage { return $this->fromStage; }

    public function getToStage(): ProjectPipelineStage { return $this->toStage; }

    public function getChangedBy(): ?User { return $this->changedBy; }

    public function getChangedAt(): \DateTimeImmutable { return $this->changedAt; }
}
