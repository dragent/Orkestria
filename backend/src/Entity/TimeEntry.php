<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\TimeEntryRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: TimeEntryRepository::class)]
class TimeEntry
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['time_entry:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'timeEntries')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['time_entry:read'])]
    private ?Employee $employee = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['time_entry:read'])]
    private ?Project $project = null;

    #[ORM\Column(type: 'decimal', precision: 5, scale: 2)]
    #[Assert\Positive]
    #[Groups(['time_entry:read'])]
    private string $hours;

    #[ORM\Column(type: 'date_immutable')]
    #[Groups(['time_entry:read'])]
    private \DateTimeImmutable $date;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['time_entry:read'])]
    private ?string $description = null;

    #[ORM\Column(length: 32, enumType: TimeEntryHourType::class)]
    #[Groups(['time_entry:read'])]
    private TimeEntryHourType $hourType = TimeEntryHourType::REGULAR;

    #[ORM\Column]
    #[Groups(['time_entry:read'])]
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

    public function getProject(): ?Project
    {
        return $this->project;
    }

    public function setProject(?Project $project): static
    {
        $this->project = $project;

        return $this;
    }

    public function getHours(): string
    {
        return $this->hours;
    }

    public function setHours(string $hours): static
    {
        $this->hours = $hours;

        return $this;
    }

    public function getDate(): \DateTimeImmutable
    {
        return $this->date;
    }

    public function setDate(\DateTimeImmutable $date): static
    {
        $this->date = $date;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getHourType(): TimeEntryHourType
    {
        return $this->hourType;
    }

    public function setHourType(TimeEntryHourType $hourType): static
    {
        $this->hourType = $hourType;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }
}
