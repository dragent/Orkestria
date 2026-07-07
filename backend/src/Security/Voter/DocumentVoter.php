<?php

declare(strict_types=1);

namespace App\Security\Voter;

use App\Entity\Document;
use App\Entity\User;
use App\Repository\RoleScopePolicyRepository;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class DocumentVoter extends Voter
{
    public const VIEW = 'DOCUMENT_VIEW';

    public function __construct(
        private readonly RoleScopePolicyRepository $roleScopePolicyRepository,
    ) {}

    protected function supports(string $attribute, mixed $subject): bool
    {
        return $attribute === self::VIEW && $subject instanceof Document;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }

        if (\in_array('ROLE_ADMIN', $user->getRoles(), true)) {
            return true;
        }

        $scopeValue = $subject->getScope()->value;

        if (\in_array($scopeValue, $user->getDocumentScopes(), true)) {
            return true;
        }

        $roleScopes = $this->roleScopePolicyRepository->findScopesForRoles($user->getRoles());

        return \in_array($scopeValue, $roleScopes, true);
    }
}
