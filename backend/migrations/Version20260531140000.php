<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Phase 13: Add note column to project_stage_history.
 */
final class Version20260531140000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Phase 13: Add note column to project_stage_history';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE project_stage_history ADD note LONGTEXT DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE project_stage_history DROP COLUMN note');
    }
}
