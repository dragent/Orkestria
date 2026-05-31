<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260428100000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Phase 4-6: Add employee, task, time_entry, quote, quote_line, invoice tables + classification fields on document';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE employee (
            id SERIAL NOT NULL,
            user_id INT DEFAULT NULL,
            company_id INT DEFAULT NULL,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            role VARCHAR(100) NOT NULL,
            skills JSON NOT NULL DEFAULT \'[]\',
            daily_rate_cents INT DEFAULT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX IDX_5D9F75A1A76ED395 ON employee (user_id)');
        $this->addSql('CREATE INDEX IDX_5D9F75A1979B1AD6 ON employee (company_id)');
        $this->addSql('ALTER TABLE employee ADD CONSTRAINT FK_5D9F75A1A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE SET NULL NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE employee ADD CONSTRAINT FK_5D9F75A1979B1AD6 FOREIGN KEY (company_id) REFERENCES company (id) ON DELETE SET NULL NOT DEFERRABLE INITIALLY IMMEDIATE');

        $this->addSql('CREATE TABLE project_employee (
            project_id INT NOT NULL,
            employee_id INT NOT NULL,
            PRIMARY KEY(project_id, employee_id)
        )');
        $this->addSql('CREATE INDEX IDX_B97A8E52166D1F9C ON project_employee (project_id)');
        $this->addSql('CREATE INDEX IDX_B97A8E528C03F15C ON project_employee (employee_id)');
        $this->addSql('ALTER TABLE project_employee ADD CONSTRAINT FK_B97A8E52166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE project_employee ADD CONSTRAINT FK_B97A8E528C03F15C FOREIGN KEY (employee_id) REFERENCES employee (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');

        $this->addSql('CREATE TABLE task (
            id SERIAL NOT NULL,
            project_id INT NOT NULL,
            assignee_id INT DEFAULT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT DEFAULT NULL,
            status VARCHAR(32) NOT NULL,
            due_date TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX IDX_527EDB25166D1F9C ON task (project_id)');
        $this->addSql('CREATE INDEX IDX_527EDB2559EC7D60 ON task (assignee_id)');
        $this->addSql('ALTER TABLE task ADD CONSTRAINT FK_527EDB25166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE task ADD CONSTRAINT FK_527EDB2559EC7D60 FOREIGN KEY (assignee_id) REFERENCES employee (id) ON DELETE SET NULL NOT DEFERRABLE INITIALLY IMMEDIATE');

        $this->addSql('CREATE TABLE time_entry (
            id SERIAL NOT NULL,
            employee_id INT NOT NULL,
            project_id INT NOT NULL,
            hours NUMERIC(5, 2) NOT NULL,
            date DATE NOT NULL,
            description TEXT DEFAULT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX IDX_6E537C718C03F15C ON time_entry (employee_id)');
        $this->addSql('CREATE INDEX IDX_6E537C71166D1F9C ON time_entry (project_id)');
        $this->addSql('ALTER TABLE time_entry ADD CONSTRAINT FK_6E537C718C03F15C FOREIGN KEY (employee_id) REFERENCES employee (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE time_entry ADD CONSTRAINT FK_6E537C71166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');

        $this->addSql('CREATE TABLE quote (
            id SERIAL NOT NULL,
            project_id INT NOT NULL,
            status VARCHAR(32) NOT NULL,
            notes TEXT DEFAULT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX IDX_6B71CBF4166D1F9C ON quote (project_id)');
        $this->addSql('ALTER TABLE quote ADD CONSTRAINT FK_6B71CBF4166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');

        $this->addSql('CREATE TABLE quote_line (
            id SERIAL NOT NULL,
            quote_id INT NOT NULL,
            label VARCHAR(255) NOT NULL,
            quantity NUMERIC(10, 2) NOT NULL,
            unit_price_cents INT NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX IDX_B779EBF2DB805178 ON quote_line (quote_id)');
        $this->addSql('ALTER TABLE quote_line ADD CONSTRAINT FK_B779EBF2DB805178 FOREIGN KEY (quote_id) REFERENCES quote (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');

        $this->addSql('CREATE TABLE invoice (
            id SERIAL NOT NULL,
            quote_id INT NOT NULL,
            status VARCHAR(32) NOT NULL,
            total_cents INT NOT NULL,
            paid_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_90651744DB805178 ON invoice (quote_id)');
        $this->addSql('ALTER TABLE invoice ADD CONSTRAINT FK_90651744DB805178 FOREIGN KEY (quote_id) REFERENCES quote (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');

        $this->addSql('ALTER TABLE document ADD classification_status VARCHAR(32) DEFAULT NULL');
        $this->addSql('ALTER TABLE document ADD classification_label VARCHAR(100) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE document DROP COLUMN classification_status');
        $this->addSql('ALTER TABLE document DROP COLUMN classification_label');
        $this->addSql('DROP TABLE IF EXISTS invoice');
        $this->addSql('DROP TABLE IF EXISTS quote_line');
        $this->addSql('DROP TABLE IF EXISTS quote');
        $this->addSql('DROP TABLE IF EXISTS time_entry');
        $this->addSql('DROP TABLE IF EXISTS task');
        $this->addSql('DROP TABLE IF EXISTS project_employee');
        $this->addSql('DROP TABLE IF EXISTS employee');
    }
}
