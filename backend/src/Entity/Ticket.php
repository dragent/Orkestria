<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\TicketRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: TicketRepository::class)]
#[ORM\Index(name: 'idx_ticket_status', columns: ['status'])]
#[ORM\Index(name: 'idx_ticket_priority', columns: ['priority'])]
#[ORM\Index(name: 'idx_ticket_project', columns: ['project_id'])]
#[ORM\Index(name: 'idx_ticket_assignee', columns: ['assignee_id'])]
class Ticket
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['ticket:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Assert\Length(max: 255)]
    #[Groups(['ticket:read'])]
    private string $title;

    #[ORM\Column(type: 'text')]
    #[Assert\NotBlank]
    #[Groups(['ticket:read'])]
    private string $description = '';

    #[ORM\Column(length: 32, enumType: TicketType::class)]
    #[Groups(['ticket:read'])]
    private TicketType $type = TicketType::TASK;

    #[ORM\Column(length: 32, enumType: TicketPriority::class)]
    #[Groups(['ticket:read'])]
    private TicketPriority $priority = TicketPriority::NORMAL;

    #[ORM\Column(length: 32, enumType: TicketStatus::class)]
    #[Groups(['ticket:read'])]
    private TicketStatus $status = TicketStatus::OPEN;

    #[ORM\Column(length: 32, enumType: TicketSource::class)]
    #[Groups(['ticket:read'])]
    private TicketSource $source = TicketSource::INTERNAL;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[Groups(['ticket:read'])]
    private ?Project $project = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['ticket:read'])]
    private ?User $reporter = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[Groups(['ticket:read'])]
    private ?Employee $assignee = null;

    #[ORM\Column]
    #[Groups(['ticket:read'])]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column]
    #[Groups(['ticket:read'])]
    private \DateTimeImmutable $updatedAt;

    #[ORM\Column(nullable: true)]
    #[Groups(['ticket:read'])]
    private ?\DateTimeImmutable $closedAt = null;

    /** Set automatically when first comment is added by assignee / staff (not the reporter). */
    #[ORM\Column(nullable: true)]
    #[Groups(['ticket:read'])]
    private ?\DateTimeImmutable $firstResponseAt = null;

    /** Set automatically when status transitions to done/closed. */
    #[ORM\Column(nullable: true)]
    #[Groups(['ticket:read'])]
    private ?\DateTimeImmutable $resolvedAt = null;

    /** @var Collection<int, TicketComment> */
    #[ORM\OneToMany(targetEntity: TicketComment::class, mappedBy: 'ticket', orphanRemoval: true, cascade: ['remove'])]
    private Collection $comments;

    public function __construct()
    {
        $now = new \DateTimeImmutable();
        $this->createdAt = $now;
        $this->updatedAt = $now;
        $this->comments = new ArrayCollection();
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

    public function getDescription(): string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getType(): TicketType
    {
        return $this->type;
    }

    public function setType(TicketType $type): static
    {
        $this->type = $type;

        return $this;
    }

    public function getPriority(): TicketPriority
    {
        return $this->priority;
    }

    public function setPriority(TicketPriority $priority): static
    {
        $this->priority = $priority;

        return $this;
    }

    public function getStatus(): TicketStatus
    {
        return $this->status;
    }

    public function setStatus(TicketStatus $status): static
    {
        $this->status = $status;

        if ($status === TicketStatus::CLOSED && $this->closedAt === null) {
            $this->closedAt = new \DateTimeImmutable();
        }
        if ($status !== TicketStatus::CLOSED) {
            $this->closedAt = null;
        }

        if (\in_array($status, [TicketStatus::DONE, TicketStatus::CLOSED], true) && $this->resolvedAt === null) {
            $this->resolvedAt = new \DateTimeImmutable();
        }
        if (!\in_array($status, [TicketStatus::DONE, TicketStatus::CLOSED], true)) {
            $this->resolvedAt = null;
        }

        return $this;
    }

    public function getSource(): TicketSource
    {
        return $this->source;
    }

    public function setSource(TicketSource $source): static
    {
        $this->source = $source;

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

    public function getReporter(): ?User
    {
        return $this->reporter;
    }

    public function setReporter(?User $reporter): static
    {
        $this->reporter = $reporter;

        return $this;
    }

    public function getAssignee(): ?Employee
    {
        return $this->assignee;
    }

    public function setAssignee(?Employee $assignee): static
    {
        $this->assignee = $assignee;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): \DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function touch(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getClosedAt(): ?\DateTimeImmutable
    {
        return $this->closedAt;
    }

    public function getFirstResponseAt(): ?\DateTimeImmutable
    {
        return $this->firstResponseAt;
    }

    public function setFirstResponseAt(?\DateTimeImmutable $firstResponseAt): static
    {
        $this->firstResponseAt = $firstResponseAt;

        return $this;
    }

    public function getResolvedAt(): ?\DateTimeImmutable
    {
        return $this->resolvedAt;
    }

    public function setResolvedAt(?\DateTimeImmutable $resolvedAt): static
    {
        $this->resolvedAt = $resolvedAt;

        return $this;
    }

    /**
     * Minutes between creation and first response. Null if not yet responded.
     */
    #[Groups(['ticket:read'])]
    public function getFirstResponseMinutes(): ?int
    {
        if ($this->firstResponseAt === null) {
            return null;
        }

        return (int) round(($this->firstResponseAt->getTimestamp() - $this->createdAt->getTimestamp()) / 60);
    }

    /**
     * Minutes between creation and resolution. Null if not yet resolved.
     */
    #[Groups(['ticket:read'])]
    public function getResolutionMinutes(): ?int
    {
        if ($this->resolvedAt === null) {
            return null;
        }

        return (int) round(($this->resolvedAt->getTimestamp() - $this->createdAt->getTimestamp()) / 60);
    }

    /** @return Collection<int, TicketComment> */
    public function getComments(): Collection
    {
        return $this->comments;
    }
}
