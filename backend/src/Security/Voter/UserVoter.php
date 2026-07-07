<?php

declare(strict_types=1);

namespace App\Security\Voter;

use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * Fine-grained access control for User resources.
 *
 * Attributes:
 *   - VIEW  : admin, or the user viewing their own profile
 *   - EDIT  : admin, or the user editing their own profile
 */
final class UserVoter extends Voter
{
    public const VIEW = 'USER_VIEW';
    public const EDIT = 'USER_EDIT';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [self::VIEW, self::EDIT], true)
            && $subject instanceof User;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $currentUser = $token->getUser();

        if (!$currentUser instanceof UserInterface) {
            return false;
        }

        /** @var User $targetUser */
        $targetUser = $subject;

        if (in_array('ROLE_ADMIN', $token->getRoleNames(), true)) {
            return true;
        }

        return match ($attribute) {
            self::VIEW, self::EDIT => $currentUser->getUserIdentifier() === $targetUser->getUserIdentifier(),
            default => false,
        };
    }
}
