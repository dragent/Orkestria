<?php

declare(strict_types=1);

namespace App\Entity;

enum ProjectPipelineStage: string
{
    case CONTACT            = 'contact';
    case MEETING            = 'meeting';
    case ENGINEER_ASSIGNED  = 'engineer_assigned';
    case QUOTE_PLAN         = 'quote_plan';
    case QUOTE_SIGNED       = 'quote_signed';
    case INVOICE_SENT       = 'invoice_sent';
    case DEPOSIT_RECEIVED   = 'deposit_received';
    case DESIGN_STARTED     = 'design_started';
    case DESIGN_COMPLETED   = 'design_completed';
    case CLIENT_SIGNED      = 'client_signed';
    case COMPONENTS_ORDERED = 'components_ordered';
    case CONSTRUCTION       = 'construction';
    case SUBCONTRACTORS     = 'subcontractors';
    case SITE_VISIT         = 'site_visit';
    case PAID               = 'paid';

    /** Ordered sequence for linear progression */
    public static function orderedCases(): array
    {
        return [
            self::CONTACT,
            self::MEETING,
            self::ENGINEER_ASSIGNED,
            self::QUOTE_PLAN,
            self::QUOTE_SIGNED,
            self::INVOICE_SENT,
            self::DEPOSIT_RECEIVED,
            self::DESIGN_STARTED,
            self::DESIGN_COMPLETED,
            self::CLIENT_SIGNED,
            self::COMPONENTS_ORDERED,
            self::CONSTRUCTION,
            self::SUBCONTRACTORS,
            self::SITE_VISIT,
            self::PAID,
        ];
    }

    public function next(): ?self
    {
        $ordered = self::orderedCases();
        $idx = array_search($this, $ordered, true);
        if ($idx === false || $idx >= \count($ordered) - 1) {
            return null;
        }

        return $ordered[$idx + 1];
    }

    public function isTerminal(): bool
    {
        return $this === self::PAID;
    }
}
