<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\LeaveRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: LeaveRepository::class)]
#[ORM\Table(name: 'employee_leave')]
class Leave
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['leave:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['leave:read'])]
    private ?Employee $employee = null;

    #[ORM\Column(length: 32, enumType: LeaveType::class)]
    #[Groups(['leave:read'])]
    private LeaveType $type = LeaveType::PAID_VACATION;

    #[ORM\Column(length: 32, enumType: LeaveStatus::class)]
    #[Groups(['leave:read'])]
    private LeaveStatus $status = LeaveStatus::PENDING;

    #[ORM\Column(type: 'date_immutable')]
    #[Assert\NotNull]
    #[Groups(['leave:read'])]
    private \DateTimeImmutable $startsAt;

    #[ORM\Column(type: 'date_immutable')]
    #[Assert\NotNull]
    #[Groups(['leave:read'])]
    private \DateTimeImmutable $endsAt;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['leave:read'])]
    private ?string $reason = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[Groups(['leave:read'])]
    private ?User $approvedBy = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['leave:read'])]
    private ?\DateTimeImmutable $approvedAt = null;

    #[ORM\Column]
    #[Groups(['leave:read'])]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getType(): LeaveType
    {
        return $this->type;
    }

    public function setType(LeaveType $type): static
    {
        $this->type = $type;

        return $this;
    }

    public function getStatus(): LeaveStatus
    {
        return $this->status;
    }

    public function setStatus(LeaveStatus $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getStartsAt(): \DateTimeImmutable
    {
        return $this->startsAt;
    }

    public function setStartsAt(\DateTimeImmutable $startsAt): static
    {
        $this->startsAt = $startsAt;

        return $this;
    }

    public function getEndsAt(): \DateTimeImmutable
    {
        return $this->endsAt;
    }

    public function setEndsAt(\DateTimeImmutable $endsAt): static
    {
        $this->endsAt = $endsAt;

        return $this;
    }

    public function getReason(): ?string
    {
        return $this->reason;
    }

    public function setReason(?string $reason): static
    {
        $this->reason = $reason;

        return $this;
    }

    public function getApprovedBy(): ?User
    {
        return $this->approvedBy;
    }

    public function setApprovedBy(?User $approvedBy): static
    {
        $this->approvedBy = $approvedBy;

        return $this;
    }

    public function getApprovedAt(): ?\DateTimeImmutable
    {
        return $this->approvedAt;
    }

    public function setApprovedAt(?\DateTimeImmutable $approvedAt): static
    {
        $this->approvedAt = $approvedAt;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    #[Groups(['leave:read'])]
    public function getWorkingDays(): int
    {
        $count = 0;
        $current = $this->startsAt;
        while ($current <= $this->endsAt) {
            $dow = (int) $current->format('N');
            if ($dow <= 5) {
                ++$count;
            }
            $current = $current->modify('+1 day');
        }

        return $count;
    }
}
