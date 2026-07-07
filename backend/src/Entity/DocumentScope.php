<?php

declare(strict_types=1);

namespace App\Entity;

enum DocumentScope: string
{
    case RH = 'rh';
    case TECH = 'tech';
    case FINANCE = 'finance';
    case DESIGN = 'design';
    case LEGAL = 'legal';
}
