<?php

declare(strict_types=1);

namespace App\Entity;

enum TicketType: string
{
    case BUG = 'bug';
    case FEATURE = 'feature';
    case TASK = 'task';
    case SUPPORT = 'support';
    case INCIDENT = 'incident';
}
