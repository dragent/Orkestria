<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Leave;
use App\Entity\LeaveStatus;
use App\Entity\Project;
use App\Entity\ProjectPipelineStage;
use App\Entity\Ticket;
use App\Entity\User;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

final class NotificationService
{
    public function __construct(
        private readonly MailerInterface $mailer,
        private readonly string $fromAddress,
    ) {}

    public function sendLeaveStatusNotification(Leave $leave): void
    {
        $employee = $leave->getEmployee();
        if ($employee === null) {
            return;
        }

        $user = $employee->getUser();
        if ($user === null) {
            return;
        }

        $name = $employee->getFirstName() . ' ' . $employee->getLastName();
        $status = $leave->getStatus();

        $subject = match ($status) {
            LeaveStatus::APPROVED  => "[Orkestria] Votre demande d'absence a été approuvée",
            LeaveStatus::REJECTED  => "[Orkestria] Votre demande d'absence a été refusée",
            LeaveStatus::CANCELLED => "[Orkestria] Votre demande d'absence a été annulée",
            default                => "[Orkestria] Mise à jour de votre demande d'absence",
        };

        $statusLabel = match ($status) {
            LeaveStatus::APPROVED  => 'approuvée',
            LeaveStatus::REJECTED  => 'refusée',
            LeaveStatus::CANCELLED => 'annulée',
            default                => 'mise à jour',
        };

        $from = $leave->getStartsAt()->format('d/m/Y');
        $to   = $leave->getEndsAt()->format('d/m/Y');
        $days = $leave->getWorkingDays();

        $body = <<<TEXT
Bonjour {$name},

Votre demande d'absence du {$from} au {$to} ({$days} jour(s) ouvré(s)) a été {$statusLabel}.

Connectez-vous à Orkestria pour plus de détails.

— L'équipe Orkestria
TEXT;

        $email = (new Email())
            ->from($this->fromAddress)
            ->to($user->getEmail())
            ->subject($subject)
            ->text($body);

        $this->mailer->send($email);
    }

    public function sendTicketAssignedNotification(Ticket $ticket): void
    {
        $assignee = $ticket->getAssignee();
        if ($assignee === null) {
            return;
        }

        $user = $assignee->getUser();
        if ($user === null) {
            return;
        }

        $name    = $assignee->getFirstName() . ' ' . $assignee->getLastName();
        $title   = $ticket->getTitle();
        $priority = $ticket->getPriority()?->value ?? 'normal';

        $body = <<<TEXT
Bonjour {$name},

Un ticket vous a été assigné sur Orkestria :

  #{$ticket->getId()} — {$title}
  Priorité : {$priority}

Connectez-vous à Orkestria pour le traiter.

— L'équipe Orkestria
TEXT;

        $email = (new Email())
            ->from($this->fromAddress)
            ->to($user->getEmail())
            ->subject("[Orkestria] Nouveau ticket assigné : {$title}")
            ->text($body);

        $this->mailer->send($email);
    }

    public function sendStageAdvancedNotification(
        Project $project,
        ProjectPipelineStage $fromStage,
        ProjectPipelineStage $toStage,
        ?User $changedBy,
        ?string $note = null,
    ): void {
        $client = $project->getClient();
        if ($client === null) {
            return;
        }

        $projectTitle  = $project->getTitle();
        $fromLabel     = $fromStage->value;
        $toLabel       = $toStage->value;
        $changedByName = $changedBy !== null
            ? $changedBy->getFirstName() . ' ' . $changedBy->getLastName()
            : 'L\'équipe Orkestria';

        $noteSection = $note !== null && trim($note) !== ''
            ? "\nNote : " . trim($note) . "\n"
            : '';

        $body = <<<TEXT
Bonjour {$client->getName()},

Le projet « {$projectTitle} » vient de passer à une nouvelle étape.

  De : {$fromLabel}
  Vers : {$toLabel}
{$noteSection}
Mis à jour par : {$changedByName}

Connectez-vous à Orkestria pour consulter le détail du projet.

— L'équipe Orkestria
TEXT;

        $email = (new Email())
            ->from($this->fromAddress)
            ->to($client->getEmail())
            ->subject("[Orkestria] Projet « {$projectTitle} » — nouvelle étape : {$toLabel}")
            ->text($body);

        $this->mailer->send($email);
    }

    public function sendComplianceDeadlineAlert(string $toEmail, string $title, \DateTimeImmutable $expiresAt, int $daysLeft): void
    {
        $dateLabel = $expiresAt->format('d/m/Y');

        $body = <<<TEXT
Bonjour,

L'échéance de conformité suivante arrive à expiration dans {$daysLeft} jour(s) :

  {$title} — expire le {$dateLabel}

Pensez à la renouveler avant cette date.

— Orkestria
TEXT;

        $email = (new Email())
            ->from($this->fromAddress)
            ->to($toEmail)
            ->subject("[Orkestria] Échéance conformité dans {$daysLeft} jour(s) : {$title}")
            ->text($body);

        $this->mailer->send($email);
    }
}
