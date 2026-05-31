<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260502120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'BTP/RH vision: time_entry hour type, compliance_deadline table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE time_entry ADD hour_type VARCHAR(32) NOT NULL DEFAULT \'regular\'');
        $this->addSql('CREATE TABLE compliance_deadline (
            id SERIAL NOT NULL,
            company_id INT NOT NULL,
            employee_id INT DEFAULT NULL,
            project_id INT DEFAULT NULL,
            title VARCHAR(255) NOT NULL,
            category VARCHAR(32) NOT NULL,
            expires_at DATE NOT NULL,
            notes TEXT DEFAULT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX IDX_CD_COMPANY ON compliance_deadline (company_id)');
        $this->addSql('CREATE INDEX IDX_CD_EXPIRES ON compliance_deadline (expires_at)');
        $this->addSql('CREATE INDEX IDX_CD_EMPLOYEE ON compliance_deadline (employee_id)');
        $this->addSql('CREATE INDEX IDX_CD_PROJECT ON compliance_deadline (project_id)');
        $this->addSql('ALTER TABLE compliance_deadline ADD CONSTRAINT FK_CD_COMPANY FOREIGN KEY (company_id) REFERENCES company (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE compliance_deadline ADD CONSTRAINT FK_CD_EMPLOYEE FOREIGN KEY (employee_id) REFERENCES employee (id) ON DELETE SET NULL NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE compliance_deadline ADD CONSTRAINT FK_CD_PROJECT FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE SET NULL NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE IF EXISTS compliance_deadline');
        $this->addSql('ALTER TABLE time_entry DROP COLUMN hour_type');
    }
}
