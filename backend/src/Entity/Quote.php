<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\QuoteRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: QuoteRepository::class)]
class Quote
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['quote:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'quotes')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['quote:read'])]
    private ?Project $project = null;

    #[ORM\Column(length: 32, enumType: QuoteStatus::class)]
    #[Groups(['quote:read'])]
    private QuoteStatus $status = QuoteStatus::DRAFT;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['quote:read'])]
    private ?string $notes = null;

    #[ORM\Column]
    #[Groups(['quote:read'])]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column]
    #[Groups(['quote:read'])]
    private \DateTimeImmutable $updatedAt;

    /** @var Collection<int, QuoteLine> */
    #[ORM\OneToMany(targetEntity: QuoteLine::class, mappedBy: 'quote', orphanRemoval: true, cascade: ['persist', 'remove'])]
    #[ORM\OrderBy(['id' => 'ASC'])]
    #[Groups(['quote:read'])]
    private Collection $lines;

    #[ORM\OneToOne(targetEntity: Invoice::class, mappedBy: 'quote')]
    #[Groups(['quote:read'])]
    private ?Invoice $invoice = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
        $this->lines = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getStatus(): QuoteStatus
    {
        return $this->status;
    }

    public function setStatus(QuoteStatus $status): static
    {
        $this->status = $status;
        $this->updatedAt = new \DateTimeImmutable();

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

    public function getUpdatedAt(): \DateTimeImmutable
    {
        return $this->updatedAt;
    }

    /** @return Collection<int, QuoteLine> */
    public function getLines(): Collection
    {
        return $this->lines;
    }

    public function addLine(QuoteLine $line): static
    {
        if (!$this->lines->contains($line)) {
            $this->lines->add($line);
            $line->setQuote($this);
        }

        return $this;
    }

    public function removeLine(QuoteLine $line): static
    {
        $this->lines->removeElement($line);

        return $this;
    }

    /** Total in cents */
    public function getTotalCents(): int
    {
        $total = 0;
        foreach ($this->lines as $line) {
            $total += $line->getTotalCents();
        }

        return $total;
    }

    public function getInvoice(): ?Invoice
    {
        return $this->invoice;
    }
}
