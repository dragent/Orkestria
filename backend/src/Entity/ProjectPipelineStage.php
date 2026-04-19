<?php

declare(strict_types=1);

namespace App\Entity;

enum ProjectPipelineStage: string
{
    case LEAD = 'lead';
    case QUOTE = 'quote';
    case PRODUCTION = 'production';
    case DELIVERY = 'delivery';
    case INVOICED = 'invoiced';
}
