<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260531100000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Phase 9: employee_leave table (absences RH)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE employee_leave (
            id SERIAL NOT NULL,
            employee_id INT NOT NULL,
            approved_by_id INT DEFAULT NULL,
            type VARCHAR(32) NOT NULL,
            status VARCHAR(32) NOT NULL DEFAULT \'pending\',
            starts_at DATE NOT NULL,
            ends_at DATE NOT NULL,
            reason TEXT DEFAULT NULL,
            approved_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX IDX_LEAVE_EMPLOYEE ON employee_leave (employee_id)');
        $this->addSql('CREATE INDEX IDX_LEAVE_STATUS ON employee_leave (status)');
        $this->addSql('CREATE INDEX IDX_LEAVE_DATES ON employee_leave (starts_at, ends_at)');
        $this->addSql('ALTER TABLE employee_leave ADD CONSTRAINT FK_LEAVE_EMPLOYEE FOREIGN KEY (employee_id) REFERENCES employee (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE employee_leave ADD CONSTRAINT FK_LEAVE_APPROVED_BY FOREIGN KEY (approved_by_id) REFERENCES "user" (id) ON DELETE SET NULL NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE IF EXISTS employee_leave');
    }
}
