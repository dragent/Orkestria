<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Phase 12: Migrate project pipeline_stage from 5 legacy values to 15 BTP workflow stages.
 * Also adds stage_changed_at column.
 */
final class Version20260531120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Phase 12: Remap project pipeline stages (5 → 15 BTP stages) + add stage_changed_at';
    }

    public function up(Schema $schema): void
    {
        // Remap existing data BEFORE changing column constraints
        $this->addSql("UPDATE project SET pipeline_stage = 'contact'      WHERE pipeline_stage = 'lead'");
        $this->addSql("UPDATE project SET pipeline_stage = 'quote_plan'   WHERE pipeline_stage = 'quote'");
        $this->addSql("UPDATE project SET pipeline_stage = 'construction' WHERE pipeline_stage = 'production'");
        $this->addSql("UPDATE project SET pipeline_stage = 'site_visit'   WHERE pipeline_stage = 'delivery'");
        $this->addSql("UPDATE project SET pipeline_stage = 'paid'         WHERE pipeline_stage = 'invoiced'");

        // Widen column to accommodate longer new values (e.g. 'components_ordered' = 19 chars)
        // PostgreSQL syntax (MySQL MODIFY is not supported)
        $this->addSql('ALTER TABLE project ALTER COLUMN pipeline_stage TYPE VARCHAR(32)');

        // Add stage_changed_at column (nullable, set on future transitions)
        // Use TIMESTAMP(0) WITHOUT TIME ZONE for PostgreSQL compatibility
        $this->addSql('ALTER TABLE project ADD stage_changed_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE project DROP COLUMN stage_changed_at');

        // Reverse data migration (best-effort — granular stages collapse to closest legacy)
        $this->addSql("UPDATE project SET pipeline_stage = 'lead'     WHERE pipeline_stage IN ('contact', 'meeting', 'engineer_assigned')");
        $this->addSql("UPDATE project SET pipeline_stage = 'quote'    WHERE pipeline_stage IN ('quote_plan', 'quote_signed')");
        $this->addSql("UPDATE project SET pipeline_stage = 'production' WHERE pipeline_stage IN ('invoice_sent', 'deposit_received', 'design_started', 'design_completed', 'client_signed', 'components_ordered', 'construction', 'subcontractors')");
        $this->addSql("UPDATE project SET pipeline_stage = 'delivery'   WHERE pipeline_stage = 'site_visit'");
        $this->addSql("UPDATE project SET pipeline_stage = 'invoiced'   WHERE pipeline_stage = 'paid'");

        $this->addSql('ALTER TABLE project ALTER COLUMN pipeline_stage TYPE VARCHAR(32)');
    }
}
