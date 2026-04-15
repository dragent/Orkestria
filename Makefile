COMPOSE = docker compose -f docker/docker-compose.yml --env-file docker/.env

# ─── Setup ────────────────────────────────────────────────────────────────────
.PHONY: install
install: ## First-time setup: copy .env and start containers
	@test -f docker/.env || cp docker/.env.example docker/.env
	$(COMPOSE) up -d --build
	$(COMPOSE) exec php php bin/console doctrine:migrations:migrate --no-interaction

# ─── Containers ───────────────────────────────────────────────────────────────
.PHONY: up
up: ## Start all containers
	$(COMPOSE) up -d

.PHONY: down
down: ## Stop all containers
	$(COMPOSE) down

.PHONY: build
build: ## Rebuild images
	$(COMPOSE) build

.PHONY: restart
restart: down up ## Restart all containers

.PHONY: logs
logs: ## Follow logs
	$(COMPOSE) logs -f

# ─── Backend ──────────────────────────────────────────────────────────────────
.PHONY: php
php: ## Open a shell in the PHP container
	$(COMPOSE) exec php sh

.PHONY: cc
cc: ## Clear Symfony cache
	$(COMPOSE) exec php php bin/console cache:clear

.PHONY: migrate
migrate: ## Run database migrations
	$(COMPOSE) exec php php bin/console doctrine:migrations:migrate --no-interaction

.PHONY: migration
migration: ## Generate a new migration
	$(COMPOSE) exec php php bin/console make:migration

.PHONY: fixtures
fixtures: ## Load fixtures
	$(COMPOSE) exec php php bin/console doctrine:fixtures:load --no-interaction

.PHONY: test-backend
test-backend: ## Run PHPUnit tests
	$(COMPOSE) exec php php bin/phpunit

# ─── Frontend ─────────────────────────────────────────────────────────────────
.PHONY: frontend
frontend: ## Open a shell in the frontend container
	$(COMPOSE) exec frontend sh

# ─── Database ─────────────────────────────────────────────────────────────────
.PHONY: db
db: ## Open a psql shell in the database container
	$(COMPOSE) exec database psql -U $${POSTGRES_USER:-orkestria} $${POSTGRES_DB:-orkestria}

.PHONY: db-reset
db-reset: ## Drop, recreate and migrate the database
	$(COMPOSE) exec php php bin/console doctrine:database:drop --force
	$(COMPOSE) exec php php bin/console doctrine:database:create
	$(COMPOSE) exec php php bin/console doctrine:migrations:migrate --no-interaction

# ─── Help ─────────────────────────────────────────────────────────────────────
.PHONY: help
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
