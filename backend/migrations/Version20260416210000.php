<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260416210000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add slug to user table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE "user" ADD slug VARCHAR(150) DEFAULT NULL');

        // Populate slug for existing rows using a deterministic fallback
        $this->addSql(<<<'SQL'
            UPDATE "user"
            SET slug = LOWER(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(
                        first_name || '-' || last_name || '-' || id::text,
                        '[^a-zA-Z0-9]+', '-', 'g'
                    ),
                    '-+', '-', 'g'
                )
            )
        SQL);

        $this->addSql('ALTER TABLE "user" ALTER COLUMN slug SET NOT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D649989D9B62 ON "user" (slug)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX UNIQ_8D93D649989D9B62');
        $this->addSql('ALTER TABLE "user" DROP slug');
    }
}
