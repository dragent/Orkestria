<?php

declare(strict_types=1);

namespace App\Entity;

enum InvoiceStatus: string
{
    case DRAFT = 'draft';
    case SENT = 'sent';
    case PAID = 'paid';
}
