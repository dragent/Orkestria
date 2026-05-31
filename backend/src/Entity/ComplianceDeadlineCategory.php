<?php

declare(strict_types=1);

namespace App\Entity;

enum ComplianceDeadlineCategory: string
{
    case CERTIFICATION = 'certification';
    case INSURANCE = 'insurance';
    case MEDICAL = 'medical';
    case OTHER = 'other';
}
