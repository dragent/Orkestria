# Orkestria — Backend (Symfony 6.4)

API REST du projet Orkestria, construite avec Symfony 6.4, Doctrine ORM et PostgreSQL.

---

## Stack

- **PHP** >= 8.1
- **Symfony** 6.4
- **Doctrine ORM** + Doctrine Migrations
- **PostgreSQL** 16
- **Symfony Messenger** (async)
- **Symfony Security** (JWT à venir)
- **PHPUnit** 13

---

## Structure

```
backend/
├── src/
│   ├── Controller/     # API controllers
│   ├── Entity/         # Doctrine entities
│   ├── Repository/     # Doctrine repositories
│   └── Kernel.php
├── config/             # Symfony configuration
├── migrations/         # Database migrations
├── tests/              # PHPUnit tests
├── compose.yaml        # Docker services (PostgreSQL)
└── .env                # Environment variables
```

---

## Installation

### Avec Docker

```bash
docker compose up -d
composer install
php bin/console doctrine:migrations:migrate
```

### Sans Docker

Configurer la variable `DATABASE_URL` dans `.env.local` puis :

```bash
composer install
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
```

---

## Variables d'environnement

| Variable        | Défaut              | Description              |
|-----------------|---------------------|--------------------------|
| `APP_ENV`       | `dev`               | Environnement applicatif |
| `APP_SECRET`    | —                   | Clé secrète Symfony      |
| `DATABASE_URL`  | PostgreSQL local    | DSN de la base de données|
| `POSTGRES_USER` | `app`               | Utilisateur PostgreSQL   |
| `POSTGRES_DB`   | `app`               | Nom de la base           |

---

## Commandes utiles

```bash
# Lancer les tests
php bin/phpunit

# Créer une entité
php bin/console make:entity

# Générer une migration
php bin/console make:migration

# Appliquer les migrations
php bin/console doctrine:migrations:migrate

# Vider le cache
php bin/console cache:clear
```

---

## Accès

- API : `http://localhost:8080/api`
