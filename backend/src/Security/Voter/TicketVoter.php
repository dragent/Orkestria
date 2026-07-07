<?php

declare(strict_types=1);

namespace App\Security\Voter;

use App\Entity\Ticket;
use App\Entity\TicketSource;
use App\Entity\TicketStatus;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class TicketVoter extends Voter
{
    public const VIEW = 'TICKET_VIEW';
    public const EDIT = 'TICKET_EDIT';
    public const DELETE = 'TICKET_DELETE';
    public const COMMENT = 'TICKET_COMMENT';

    private const ATTRIBUTES = [self::VIEW, self::EDIT, self::DELETE, self::COMMENT];

    protected function supports(string $attribute, mixed $subject): bool
    {
        return \in_array($attribute, self::ATTRIBUTES, true) && $subject instanceof Ticket;
    }

    /**
     * @param Ticket $subject
     */
    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }

        $roles = $user->getRoles();
        $isAdmin = \in_array('ROLE_ADMIN', $roles, true);
        $isDeveloper = \in_array('ROLE_DEVELOPER', $roles, true);
        $isClient = \in_array('ROLE_CLIENT', $roles, true);

        if ($attribute === self::DELETE) {
            return $isAdmin;
        }

        if ($isAdmin || $isDeveloper) {
            return true;
        }

        $isReporter = $subject->getReporter()?->getId() === $user->getId();
        $isAssigneeUser = $subject->getAssignee()?->getUser()?->getId() === $user->getId();

        if ($attribute === self::VIEW || $attribute === self::COMMENT) {
            if ($isReporter || $isAssigneeUser) {
                return true;
            }

            if ($isClient && $subject->getSource() === TicketSource::CLIENT) {
                $project = $subject->getProject();
                $client = $project?->getClient();

                return $client !== null && $client->getEmail() === $user->getEmail();
            }

            return false;
        }

        if ($attribute === self::EDIT) {
            if ($isAssigneeUser) {
                return true;
            }
            if ($isReporter && $subject->getStatus() === TicketStatus::OPEN) {
                return true;
            }
        }

        return false;
    }
}
