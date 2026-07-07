<?php

declare(strict_types=1);

namespace App\Security\Voter;

use App\Entity\Company;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * Fine-grained access control for Company resources.
 *
 * Attributes:
 *   - VIEW  : admin, or a member of the company
 *   - EDIT  : admin only
 */
final class CompanyVoter extends Voter
{
    public const VIEW = 'COMPANY_VIEW';
    public const EDIT = 'COMPANY_EDIT';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [self::VIEW, self::EDIT], true)
            && $subject instanceof Company;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $currentUser = $token->getUser();

        if (!$currentUser instanceof UserInterface) {
            return false;
        }

        if (in_array('ROLE_ADMIN', $token->getRoleNames(), true)) {
            return true;
        }

        /** @var Company $company */
        $company = $subject;

        return match ($attribute) {
            self::VIEW => $currentUser instanceof User && $currentUser->getCompany()?->getId() === $company->getId(),
            self::EDIT => false,
            default => false,
        };
    }
}
