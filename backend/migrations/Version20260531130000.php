<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Phase 12: Create project_stage_history table for audit trail of stage transitions.
 */
final class Version20260531130000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Phase 12: Create project_stage_history table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('
            CREATE TABLE project_stage_history (
                id           INT AUTO_INCREMENT NOT NULL,
                project_id   INT         NOT NULL,
                changed_by_id INT        DEFAULT NULL,
                from_stage   VARCHAR(32) NOT NULL,
                to_stage     VARCHAR(32) NOT NULL,
                changed_at   DATETIME    NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
                PRIMARY KEY (id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        ');

        $this->addSql('ALTER TABLE project_stage_history ADD CONSTRAINT FK_PROJECT_STAGE_HISTORY_PROJECT FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE project_stage_history ADD CONSTRAINT FK_PROJECT_STAGE_HISTORY_USER FOREIGN KEY (changed_by_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_PROJECT_STAGE_HISTORY_PROJECT ON project_stage_history (project_id)');
        $this->addSql('CREATE INDEX IDX_PROJECT_STAGE_HISTORY_USER ON project_stage_history (changed_by_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE project_stage_history DROP FOREIGN KEY FK_PROJECT_STAGE_HISTORY_PROJECT');
        $this->addSql('ALTER TABLE project_stage_history DROP FOREIGN KEY FK_PROJECT_STAGE_HISTORY_USER');
        $this->addSql('DROP TABLE project_stage_history');
    }
}
