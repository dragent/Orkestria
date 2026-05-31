<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\RoleScopePolicyRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: RoleScopePolicyRepository::class)]
#[ORM\Table(name: 'role_scope_policy')]
class RoleScopePolicy
{
    #[ORM\Id]
    #[ORM\Column(length: 100)]
    #[Groups(['role_scope_policy:read'])]
    private string $role;

    /**
     * Document scope keys the role may access (e.g. rh, tech).
     *
     * @var list<string>
     */
    #[ORM\Column(type: 'json')]
    #[Groups(['role_scope_policy:read'])]
    private array $documentScopes = [];

    public function __construct(string $role)
    {
        $this->role = $role;
    }

    public function getRole(): string
    {
        return $this->role;
    }

    /** @return list<string> */
    public function getDocumentScopes(): array
    {
        return $this->documentScopes;
    }

    /** @param list<string> $documentScopes */
    public function setDocumentScopes(array $documentScopes): static
    {
        $this->documentScopes = array_values(array_unique($documentScopes));

        return $this;
    }
}
