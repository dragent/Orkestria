<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260416200000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add email verification fields to user table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE "user" ADD is_verified BOOLEAN NOT NULL DEFAULT FALSE');
        $this->addSql('ALTER TABLE "user" ADD verification_token VARCHAR(100) DEFAULT NULL');
        $this->addSql('ALTER TABLE "user" ADD verification_token_expires_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE "user" DROP is_verified');
        $this->addSql('ALTER TABLE "user" DROP verification_token');
        $this->addSql('ALTER TABLE "user" DROP verification_token_expires_at');
    }
}
