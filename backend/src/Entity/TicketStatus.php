<?php

declare(strict_types=1);

namespace App\Entity;

enum TicketStatus: string
{
    case OPEN = 'open';
    case IN_PROGRESS = 'in_progress';
    case IN_REVIEW = 'in_review';
    case DONE = 'done';
    case CLOSED = 'closed';
}
