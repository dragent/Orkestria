<?php

declare(strict_types=1);

namespace App\Entity;

enum TicketSource: string
{
    case INTERNAL = 'internal';
    case CLIENT = 'client';
}
