<?php

declare(strict_types=1);

namespace App\Entity;

enum LeaveType: string
{
    case PAID_VACATION = 'paid_vacation';
    case RTT           = 'rtt';
    case SICK          = 'sick';
    case TRAINING      = 'training';
    case OTHER         = 'other';
}
