<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260501190000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add ticket and ticket_comment tables for dev/support module';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE ticket (
            id SERIAL NOT NULL,
            project_id INT DEFAULT NULL,
            reporter_id INT NOT NULL,
            assignee_id INT DEFAULT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            type VARCHAR(32) NOT NULL,
            priority VARCHAR(32) NOT NULL,
            status VARCHAR(32) NOT NULL,
            source VARCHAR(32) NOT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            closed_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX idx_ticket_status ON ticket (status)');
        $this->addSql('CREATE INDEX idx_ticket_priority ON ticket (priority)');
        $this->addSql('CREATE INDEX idx_ticket_project ON ticket (project_id)');
        $this->addSql('CREATE INDEX idx_ticket_assignee ON ticket (assignee_id)');
        $this->addSql('CREATE INDEX idx_ticket_reporter ON ticket (reporter_id)');
        $this->addSql('ALTER TABLE ticket ADD CONSTRAINT FK_TICKET_PROJECT FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE SET NULL NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE ticket ADD CONSTRAINT FK_TICKET_REPORTER FOREIGN KEY (reporter_id) REFERENCES "user" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE ticket ADD CONSTRAINT FK_TICKET_ASSIGNEE FOREIGN KEY (assignee_id) REFERENCES employee (id) ON DELETE SET NULL NOT DEFERRABLE INITIALLY IMMEDIATE');

        $this->addSql('CREATE TABLE ticket_comment (
            id SERIAL NOT NULL,
            ticket_id INT NOT NULL,
            author_id INT NOT NULL,
            body TEXT NOT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX idx_ticket_comment_ticket ON ticket_comment (ticket_id)');
        $this->addSql('CREATE INDEX idx_ticket_comment_author ON ticket_comment (author_id)');
        $this->addSql('ALTER TABLE ticket_comment ADD CONSTRAINT FK_TC_TICKET FOREIGN KEY (ticket_id) REFERENCES ticket (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE ticket_comment ADD CONSTRAINT FK_TC_AUTHOR FOREIGN KEY (author_id) REFERENCES "user" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE IF EXISTS ticket_comment');
        $this->addSql('DROP TABLE IF EXISTS ticket');
    }
}
