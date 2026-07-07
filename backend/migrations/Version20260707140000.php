<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * CRM: Enrich Client with phone, address, notes, tags.
 */
final class Version20260707140000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'CRM: Enrich Client with phone, address, notes, tags';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE client ADD phone VARCHAR(50) DEFAULT NULL');
        $this->addSql('ALTER TABLE client ADD address VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE client ADD city VARCHAR(100) DEFAULT NULL');
        $this->addSql('ALTER TABLE client ADD postal_code VARCHAR(20) DEFAULT NULL');
        $this->addSql('ALTER TABLE client ADD country VARCHAR(100) DEFAULT NULL');
        $this->addSql('ALTER TABLE client ADD notes LONGTEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE client ADD tags JSON NOT NULL DEFAULT \'[]\'');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE client DROP COLUMN tags');
        $this->addSql('ALTER TABLE client DROP COLUMN notes');
        $this->addSql('ALTER TABLE client DROP COLUMN country');
        $this->addSql('ALTER TABLE client DROP COLUMN postal_code');
        $this->addSql('ALTER TABLE client DROP COLUMN city');
        $this->addSql('ALTER TABLE client DROP COLUMN address');
        $this->addSql('ALTER TABLE client DROP COLUMN phone');
    }
}