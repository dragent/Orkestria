<?php

declare(strict_types=1);

namespace App\Entity;

enum TimeEntryHourType: string
{
    /** Heures ordinaires */
    case REGULAR = 'regular';
    /** Nuit */
    case NIGHT = 'night';
    /** Week-end */
    case WEEKEND = 'weekend';
    /** Déplacement */
    case TRAVEL = 'travel';
    /** Astreinte */
    case ON_CALL = 'on_call';
}
