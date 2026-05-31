<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\EmployeeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: EmployeeRepository::class)]
class Employee
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['employee:read', 'compliance_deadline:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['employee:read'])]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'employees')]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['employee:read'])]
    private ?Company $company = null;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank]
    #[Groups(['employee:read', 'compliance_deadline:read'])]
    private string $firstName;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank]
    #[Groups(['employee:read', 'compliance_deadline:read'])]
    private string $lastName;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank]
    #[Groups(['employee:read'])]
    private string $role;

    /** @var list<string> */
    #[ORM\Column(type: 'json', options: ['default' => '[]'])]
    #[Groups(['employee:read'])]
    private array $skills = [];

    /** Daily rate in cents */
    #[ORM\Column(nullable: true)]
    #[Groups(['employee:read'])]
    private ?int $dailyRateCents = null;

    #[ORM\Column]
    #[Groups(['employee:read'])]
    private \DateTimeImmutable $createdAt;

    /** @var Collection<int, Project> */
    #[ORM\ManyToMany(targetEntity: Project::class, mappedBy: 'employees')]
    private Collection $projects;

    /** @var Collection<int, Task> */
    #[ORM\OneToMany(targetEntity: Task::class, mappedBy: 'assignee')]
    private Collection $tasks;

    /** @var Collection<int, TimeEntry> */
    #[ORM\OneToMany(targetEntity: TimeEntry::class, mappedBy: 'employee', orphanRemoval: true)]
    private Collection $timeEntries;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->projects = new ArrayCollection();
        $this->tasks = new ArrayCollection();
        $this->timeEntries = new ArrayCollection();
        $this->skills = [];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
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

    public function getFirstName(): string
    {
        return $this->firstName;
    }

    public function setFirstName(string $firstName): static
    {
        $this->firstName = $firstName;

        return $this;
    }

    public function getLastName(): string
    {
        return $this->lastName;
    }

    public function setLastName(string $lastName): static
    {
        $this->lastName = $lastName;

        return $this;
    }

    public function getRole(): string
    {
        return $this->role;
    }

    public function setRole(string $role): static
    {
        $this->role = $role;

        return $this;
    }

    /** @return list<string> */
    public function getSkills(): array
    {
        return $this->skills;
    }

    /** @param list<string> $skills */
    public function setSkills(array $skills): static
    {
        $this->skills = array_values($skills);

        return $this;
    }

    public function getDailyRateCents(): ?int
    {
        return $this->dailyRateCents;
    }

    public function setDailyRateCents(?int $dailyRateCents): static
    {
        $this->dailyRateCents = $dailyRateCents;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    /** @return Collection<int, Project> */
    public function getProjects(): Collection
    {
        return $this->projects;
    }

    /** @return Collection<int, Task> */
    public function getTasks(): Collection
    {
        return $this->tasks;
    }

    /** @return Collection<int, TimeEntry> */
    public function getTimeEntries(): Collection
    {
        return $this->timeEntries;
    }
}
