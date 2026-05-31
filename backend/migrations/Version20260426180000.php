<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260426180000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add role_scope_policy table for per-role document access configuration';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("CREATE TABLE role_scope_policy (role VARCHAR(100) NOT NULL, document_scopes JSON NOT NULL, PRIMARY KEY(role))");
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE role_scope_policy');
    }
}
