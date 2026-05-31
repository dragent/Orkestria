<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260531110000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Phase 10 improvements: ticket SLA fields (first_response_at, resolved_at)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE ticket ADD COLUMN first_response_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE ticket ADD COLUMN resolved_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');

        // Backfill resolved_at for already-done/closed tickets using closed_at
        $this->addSql("UPDATE ticket SET resolved_at = closed_at WHERE status IN ('done', 'closed') AND closed_at IS NOT NULL");
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE ticket DROP COLUMN IF EXISTS first_response_at');
        $this->addSql('ALTER TABLE ticket DROP COLUMN IF EXISTS resolved_at');
    }
}
