# Roadmap — Orkestria

Statuts : ✅ Terminé · 🔄 En cours · ⬜ À faire

---

## Phase 1 — Fondations & Identité _(en cours)_

### Authentification & Sécurité
- ✅ JWT login / logout
- ✅ Inscription avec vérification email
- ✅ Mot de passe oublié / réinitialisation
- ✅ `UserChecker` (compte inactif, email non vérifié)
- ✅ Rôles `ROLE_ADMIN`, `ROLE_USER` (base)
- ✅ Rôles `ROLE_SUBCONTRACTOR`, `ROLE_CLIENT` — onboarding & assignation
- ✅ Voters Symfony pour permissions fines par ressource

### Gestion des utilisateurs & entreprises
- ✅ Entités `User` et `Company` avec migrations
- ✅ Endpoint `GET /api/me`
- ✅ Endpoints `GET /api/users` et `GET /api/users/{id}` (admin)
- ✅ Listing companies en lecture seule (API Platform)
- ⬜ `POST /api/companies` — création d'entreprise
- ⬜ `PATCH /api/companies/{id}` — mise à jour
- ⬜ `POST /api/admin/users` — création manuelle d'utilisateur par l'admin
- ✅ `PATCH /api/admin/users/{id}` — modification de rôle / statut
- ⬜ Assignation d'un utilisateur à une entreprise

### Frontend — Dashboard admin
- ✅ Layout dashboard (sidebar, thème, langue, logout)
- ✅ Page d'accueil dashboard (compteurs utilisateurs/entreprises)
- ✅ Pages listing utilisateurs et entreprises
- ✅ Pages détail utilisateur et entreprise
- ⬜ Installer Zustand + TanStack Query (remplacer les `useEffect/fetch`)
- ⬜ Formulaires création / édition entreprise
- ⬜ Formulaire création / édition utilisateur (admin)
- ⬜ Guards de route par rôle (`middleware.ts`)
- ⬜ Séparation des espaces : `/admin`, `/subcontractor`, `/client`

### Infrastructure
- ✅ Docker (PHP-FPM, Nginx, Next.js, PostgreSQL, Mailpit)
- ⬜ Tests PHPUnit (au moins les flux auth)
- ⬜ Variables d'environnement documentées (`.env.example`)

---

## Phase 2 — Projets & Clients

### Backend
- ⬜ Entité `Client` (nom, email, entreprise liée)
- ⬜ Entité `Project` (titre, statut, pipeline, client, dates)
- ⬜ CRUD complet `Client` avec contrôle d'accès admin
- ⬜ CRUD complet `Project` avec contrôle d'accès admin
- ⬜ Pipeline projet : `lead → devis → production → livraison → facturé`
- ⬜ Endpoint de recherche / filtrage projets

### Frontend
- ⬜ Page listing clients + formulaire création/édition
- ⬜ Page listing projets + formulaire création/édition
- ⬜ Vue détail projet (infos, statut, timeline)
- ⬜ Changement de statut du pipeline (drag or select)
- ⬜ Dashboard mis à jour avec métriques projets

---

## Phase 3 — Documents & Scopes

### Backend
- ⬜ Entité `Scope` (RH, TECH, FINANCE, DESIGN, LEGAL)
- ⬜ Entité `Document` (nom, type, chemin fichier, scope, projet)
- ⬜ Upload de fichiers (stockage local ou S3)
- ⬜ Contrôle d'accès par scope (Voter Symfony)
- ⬜ Endpoint listing documents par projet et par scope

### Frontend
- ⬜ Interface d'upload de documents
- ⬜ Listing documents par projet avec filtre par scope
- ⬜ Téléchargement de fichiers
- ⬜ Restriction UI selon le scope de l'utilisateur connecté

---

## Phase 4 — Employés & Sous-traitants

### Backend
- ⬜ Entité `Employee` (rôle, compétences, coût journalier, utilisateur lié)
- ⬜ Assignation d'employés à un projet
- ⬜ Time tracking (entrées de temps par employé/projet)
- ⬜ Interface sous-traitant : accès restreint aux projets assignés
- ⬜ Upload de livrables par les sous-traitants
- ⬜ Suivi des tâches (`Task`) par projet et par responsable

### Frontend
- ⬜ Espace `/subcontractor` — projets assignés, tâches, upload livrables
- ⬜ Page listing employés (admin)
- ⬜ Fiche employé (compétences, assignations, temps)
- ⬜ Vue time tracking

---

## Phase 5 — Devis & Facturation

### Backend
- ⬜ Entité `Quote` (lignes, montants, statut, validé par client)
- ⬜ Entité `Invoice` (générée depuis devis validé, PDF)
- ⬜ Calcul automatique des marges (coût employés vs montant facturé)
- ⬜ Suivi des revenus par projet / période
- ⬜ Génération PDF (devis, factures)

### Frontend
- ⬜ Espace `/client` — timeline projet, validation devis, factures
- ⬜ Formulaire de création de devis (lignes dynamiques)
- ⬜ Vue validation devis côté client
- ⬜ Téléchargement des factures PDF
- ⬜ Dashboard financier (revenus, marges, projets facturés)

---

## Phase 6 — IA documentaire

### Backend
- ⬜ Service de classification de documents (LLM ou modèle embarqué)
- ⬜ Détection automatique du type (contrat, facture, livrable…)
- ⬜ Attribution automatique d'un scope
- ⬜ Traitement asynchrone via Symfony Messenger

### Frontend
- ⬜ Indicateur de classification en cours (loading state)
- ⬜ Interface de correction manuelle si classification incorrecte
- ⬜ Historique des classifications par document

---

## Transversal (toutes phases)

- ⬜ Tests E2E frontend (Playwright)
- ⬜ Tests d'intégration backend (PHPUnit)
- ⬜ CI/CD (GitHub Actions : lint, tests, build)
- ⬜ Redis (cache + sessions optionnel)
- ⬜ Monitoring / logging (Sentry ou équivalent)
- ⬜ Documentation API (API Platform / Swagger)
- ⬜ README frontend (remplacer le stub create-next-app)
