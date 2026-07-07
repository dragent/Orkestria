<?php

declare(strict_types=1);

namespace App\Entity;

enum ClientStatus: string
{
    case LEAD = 'lead';
    case ACTIVE = 'active';
}