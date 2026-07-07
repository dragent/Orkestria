# 🚀 Orkestria — Multi-Tenant Project & Workforce Management Platform

## 🧠 Overview

**Orkestria** est une plateforme SaaS permettant de gérer un projet de bout en bout entre :

* 🏢 une entreprise
* 🔧 des sous-traitants
* 👤 des clients

Elle intègre :

* gestion de projet complète
* suivi financier (devis → facture)
* gestion des employés
* segmentation par domaines métiers (scopes)
* classification intelligente des documents via IA

---

## 🎯 Objectif

Centraliser et orchestrer :

* la collaboration multi-acteurs
* la gestion documentaire
* la répartition des responsabilités
* la rentabilité des projets

Pour une **vision métier** (dirigeant BTP, responsable RH : axes d’amélioration et priorisation), voir [VISION_BTP_RH.md](VISION_BTP_RH.md).
Pour la **vision dev / module de tickets** (espace `/dev`, support client, kanban), voir [VISION_DEV.md](VISION_DEV.md).

---

## 👁️ Les 3 visions

### 🏢 Entreprise (Admin)

* gestion des clients, projets et employés
* assignation des sous-traitants
* suivi des coûts et marges
* dashboard global
* gestion des documents et dossiers

---

### 🔧 Sous-traitant

* accès aux projets assignés
* modification limitée à leur domaine
* upload de livrables
* suivi des tâches

---

### 👤 Client

* suivi du projet (timeline)
* validation des devis
* accès aux documents
* téléchargement des factures

---

## 🧩 Fonctionnalités principales

### 📁 Gestion des projets

* création et suivi complet
* pipeline : lead → devis → production → facture

---

### 👥 Gestion des employés

* fiche employé (rôle, compétences, coût journalier)
* assignation aux projets
* suivi du temps (time tracking) avec types d'heures : standard, nuit, week-end, déplacement, astreinte
* export CSV des temps pour la paie (`GET /api/admin/payroll/time-entries.csv`)

---

### 🏗️ Pilotage BTP & RH (`/admin/btp-rh`)

* indicateurs dirigeant : CA devis acceptés, heures saisies, projets par étape
* export paie CSV filtrable par période et par entreprise
* gestion des échéances conformité (habilitations, assurances, visites médicales) avec alertes à 30 jours
* rôle `ROLE_RH` avec accès dédié au tableau de bord BTP/RH

---

### 🔐 Gestion des accès par domaine (Scopes)

Chaque utilisateur intervient uniquement dans son domaine métier :

* RH
* TECH
* FINANCE
* DESIGN
* LEGAL

👉 Accès restreint aux documents et actions selon le scope

---

### 🤖 IA documentaire

* classification automatique des fichiers
* détection du type de document
* attribution du domaine (scope)
* organisation intelligente des dossiers

---

### 💰 Gestion financière

* création de devis
* génération de factures
* calcul automatique des marges
* suivi des revenus

---

### 🎫 Tickets dev & support

* file unifiée pour les tickets internes (bug, feature, tâche tech) et les remontées de support clients
* espace dédié `/dev` pour les développeurs (`ROLE_DEVELOPER`)
* board kanban (drag & drop), filtres (statut, priorité, type, source, projet, assignation)
* commentaires par ticket, journalisation des dates
* permissions fines via `TicketVoter` (admin, dev, reporter, client sur ses propres tickets)

---

### ⚡ Infrastructure & Qualité

* **Redis** — cache Symfony + transport Messenger (file d'attente asynchrone) ; service inclus dans Docker
* **Tests E2E Playwright** — config + suites d'authentification et de navigation (`frontend/e2e/`)
* **Tests PHPUnit** — flux auth, tickets, devis, sous-traitant, BTP/RH (`backend/tests/Functional/`)
* **Monitoring Sentry** — prêt à l'emploi : définir `SENTRY_DSN` + `composer require sentry/sentry-symfony` côté backend, `npm install @sentry/nextjs` côté frontend

---

## 🏗️ Stack technique

### Frontend

* Next.js (App Router)
* TailwindCSS
* Zustand
* TanStack Query

---

### Backend

* Symfony
* API Platform
* JWT Authentication
* Symfony Messenger (async processing)

---

### Infrastructure

* Docker
* Nginx
* PostgreSQL
* (optionnel) Redis

---

## 🐳 Installation (Docker)

### Prérequis

* Docker
* Docker Compose

---

### Lancer le projet

```bash
git clone <repo>
cd orkestria
docker compose -f docker/docker-compose.yml --env-file docker/.env up --build
```

Ou avec le Makefile : `make install` (première fois) puis `make up`.

---

### Frontend : erreur « Module not found » (ex. `@tanstack/react-query`)

En développement Docker, les dépendances NPM sont dans un **volume** (`frontend_node_modules`), pas dans le dossier `frontend/` sur la machine hôte. Après un `git pull` qui modifie `package.json` / `package-lock.json`, réinstalle dans le conteneur :

```bash
make frontend-npm-ci
docker compose -f docker/docker-compose.yml --env-file docker/.env up -d frontend
```

Sans Makefile :

```bash
docker compose -f docker/docker-compose.yml --env-file docker/.env run --rm frontend npm ci
```

En local (sans Docker), exécuter `npm install` dans le répertoire `frontend/`. Les scripts `npm run dev` et `npm run build` lancent aussi `npm ci` automatiquement si `node_modules` est incomplet.

Avec Docker, l’image de développement exécute `npm ci` au démarrage du conteneur lorsque les paquets attendus sont absents du volume (rebuild : `docker compose … build frontend` puis `up -d frontend`).

---

### Accès

* Frontend : http://localhost:3000
* Backend API : http://localhost:8080/api

---

## 🧱 Architecture

```
/backend     → Symfony API
/frontend    → Next.js app
/docker      → configuration Docker
```

---

## 🗃️ Modélisation (simplifiée)

* User
* Company
* Employee
* Client
* Project
* Scope
* Document
* Quote
* Invoice
* Task

---

## 🔐 Sécurité

* Authentification JWT

* rôles :

  * ROLE_ADMIN
  * ROLE_SUBCONTRACTOR
  * ROLE_CLIENT

* contrôle d’accès via scopes

* Voters Symfony pour permissions fines

---

## 🔄 Workflow projet

1. Création client
2. Création projet
3. Upload documents
4. Génération devis
5. Validation client
6. Production (employés + sous-traitants)
7. Livraison
8. Facturation

---

## 🤖 IA — fonctionnement

1. Upload d’un document
2. Analyse du contenu
3. Détection du type (facture, contrat…)
4. Attribution d’un scope
5. Classement automatique

---

## 🚀 Roadmap

### Phase 1

* Auth & rôles
* CRUD projets / clients

### Phase 2

* gestion documentaire
* scopes

### Phase 3

* employés & sous-traitants

### Phase 4

* devis / facturation

### Phase 5

* IA documentaire

---

## 📈 Vision produit

Orkestria est conçu comme un **produit SaaS scalable**, permettant :

* une organisation claire des responsabilités
* une collaboration fluide entre acteurs
* une automatisation intelligente des processus

---

## 🧑‍💻 Auteur

Projet développé dans une logique **fullstack moderne (Next.js + Symfony + Docker)** avec une approche orientée produit.

---
