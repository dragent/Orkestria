# Roadmap — Orkestria

Statuts : ✅ Terminé · 🔄 En cours · ⬜ À faire

---

## Phase 1 — Fondations & Identité _(branche `feat/roadmap-phase-1`)_

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
- ✅ `POST /api/companies` — création d'entreprise
- ✅ `PATCH /api/companies/{id}` — mise à jour
- ✅ `POST /api/admin/users` — création manuelle d'utilisateur par l'admin
- ✅ `PATCH /api/admin/users/{id}` — modification de rôle / statut
- ✅ Assignation d'un utilisateur à une entreprise

### Frontend — Dashboard admin
- ✅ Layout dashboard (sidebar, thème, langue, logout)
- ✅ Page d'accueil dashboard (compteurs utilisateurs/entreprises)
- ✅ Pages listing utilisateurs et entreprises
- ✅ Pages détail utilisateur et entreprise
- ✅ Installer Zustand + TanStack Query (remplacer les `useEffect/fetch`)
- ✅ Formulaires création / édition entreprise
- ✅ Formulaire création / édition utilisateur (admin)
- ✅ Guards de route par rôle (`proxy.ts`, Next.js 16)
- ✅ Séparation des espaces : `/admin`, `/subcontractor`, `/client`

### Infrastructure
- ✅ Docker (PHP-FPM, Nginx, Next.js, PostgreSQL, Mailpit, Redis)
- ✅ Tests PHPUnit (au moins les flux auth)
- ✅ Variables d'environnement documentées (`backend/.env.example`)

---

## Phase 2 — Projets & Clients _(branche `feat/roadmap-phase-2`)_

### Backend
- ✅ Entité `Client` (nom, email, entreprise liée)
- ✅ Entité `Project` (titre, statut, pipeline, client, dates)
- ✅ CRUD complet `Client` avec contrôle d'accès admin
- ✅ CRUD complet `Project` avec contrôle d'accès admin
- ✅ Pipeline projet : `lead → devis → production → livraison → facturé`
- ✅ Endpoint de recherche / filtrage projets

### Frontend
- ✅ Page listing clients + formulaire création/édition
- ✅ Page listing projets + formulaire création/édition
- ✅ Vue détail projet (infos, statut, timeline)
- ✅ Changement de statut du pipeline (drag or select)
- ✅ Dashboard mis à jour avec métriques projets

---

## Phase 3 — Documents & Scopes _(branche `feat/roadmap-phase-3`)_

### Backend
- ✅ Entité `DocumentScope` (RH, TECH, FINANCE, DESIGN, LEGAL)
- ✅ Entité `Document` (nom, type, chemin fichier, scope, projet)
- ✅ Upload de fichiers (stockage local sous `var/uploads`)
- ✅ Contrôle d'accès par scope (`DocumentVoter` + `document_scopes` sur `User`)
- ✅ Endpoint listing documents par projet et par scope

### Frontend
- ✅ Interface d'upload de documents (fiche projet)
- ✅ Listing documents par projet avec filtre par scope
- ✅ Téléchargement de fichiers
- ✅ Scopes documentaires assignables côté admin (utilisateur) ; listing filtré côté API pour les non-admins

---

## Phase 4 — Employés & Sous-traitants

### Backend
- ✅ Entité `Employee` (rôle, compétences, coût journalier, utilisateur lié)
- ✅ Assignation d'employés à un projet (many-to-many `project_employee`)
- ✅ Time tracking (`TimeEntry` — entrées de temps par employé/projet, avec `hourType` : standard, nuit, week-end, déplacement, astreinte)
- ✅ Interface sous-traitant : accès restreint aux projets assignés (`/api/subcontractor/projects`)
- ✅ Upload de livrables par les sous-traitants (via l'endpoint documents existant)
- ✅ Suivi des tâches (`Task`) par projet et par responsable

### Frontend
- ✅ Espace `/subcontractor` — projets assignés, tâches, mark-done
- ✅ Page listing employés (admin)
- ✅ Fiche employé (compétences, lien utilisateur, taux journalier)
- ✅ Section tâches dans la fiche projet (admin)
- ✅ Section suivi du temps dans la fiche projet (admin) avec sélecteur de type d'heure

---

## Phase 5 — Devis & Facturation

### Backend
- ✅ Entité `Quote` (lignes, montants, statut, validé par client)
- ✅ Entité `QuoteLine` (label, quantité, prix unitaire en centimes)
- ✅ Entité `Invoice` (générée depuis devis accepté, statut, snapshot montant)
- ✅ Calcul automatique des totaux (coût lignes)
- ✅ Suivi des revenus par projet (total devis)
- ✅ Génération HTML imprimable (devis, factures) via Twig

### Frontend
- ✅ Espace `/client` — timeline projet, validation devis, factures
- ✅ Formulaire de création de devis (lignes dynamiques) dans la fiche projet admin
- ✅ Vue validation devis côté client (accept/reject)
- ✅ Téléchargement/affichage des factures HTML (imprimables en PDF)
- ✅ Section devis & factures dans la fiche projet admin

---

## Phase 6 — IA documentaire

### Backend
- ✅ Service de classification de documents (basé sur mots-clés du nom de fichier)
- ✅ Détection automatique du type (contrat, facture, livrable…)
- ✅ Attribution automatique d'un scope suggéré
- ✅ Traitement asynchrone via Symfony Messenger (`ClassifyDocumentMessage`)

### Frontend
- ✅ Champs `classificationStatus` et `classificationLabel` sur les documents
- ✅ Endpoint PATCH pour correction manuelle de la classification
- ✅ Affichage du statut de classification dans la section documents

---

## Phase 7 — Tickets dev & support

### Backend
- ✅ Entités `Ticket` et `TicketComment` + enums (`TicketStatus`, `TicketPriority`, `TicketType`, `TicketSource`)
- ✅ `TicketRepository::findFiltered` (statut, priorité, type, source, projet, assigné, recherche)
- ✅ `TicketController` (CRUD + commentaires) protégé par `TicketVoter`
- ✅ `ClientTicketController` — ouverture / lecture par les clients sur leurs propres projets
- ✅ Migration tables `ticket` et `ticket_comment`
- ✅ Tests fonctionnels (CRUD, permissions, commentaires)

### Frontend
- ✅ `ticketsApi` + hooks TanStack (list, get, create, update, delete, comments)
- ✅ Page admin `/admin/tickets` (kanban DnD via `@dnd-kit`, vue liste, filtres, création)
- ✅ Page détail `/admin/tickets/[id]` (édition + commentaires + suppression)
- ✅ `ProjectTicketsSection` dans la fiche projet admin
- ✅ Espace `/dev` (layout, dashboard, kanban personnel, détail)
- ✅ Section support sur `/client/projects/[id]` (création + liste des tickets)
- ✅ Garde de route `/dev` (`ROLE_DEVELOPER`) + redirection post-login
- ✅ i18n FR/EN du module
- ✅ Tests Jest (rendu, vue liste)

---

## Phase 8 — BTP / RH _(vision patron de BTP et responsable RH)_

### Backend
- ✅ Entité `ComplianceDeadline` (habilitations, assurances, visites médicales) + enum `ComplianceDeadlineCategory`
- ✅ `ComplianceDeadlineController` — CRUD complet filtré (`companyId`, `upcomingDays`) — accès `ROLE_RH`
- ✅ `PayrollExportController` — export CSV des temps par période et par entreprise — accès `ROLE_RH`
- ✅ `BtpExecutiveDashboardController` — KPIs dirigeant (CA devis acceptés, heures 30 jours, projets par étape, échéances proches) — accès `ROLE_ADMIN`
- ✅ `RoleScopePolicyController` — gestion des permissions documentaires par rôle — accès `ROLE_ADMIN`
- ✅ `TimeEntryHourType` : distinction standard / nuit / week-end / déplacement / astreinte
- ✅ Migration `Version20260502120000` (hour_type + compliance_deadline)
- ✅ Tests fonctionnels BTP/RH (`BtpVisionFunctionalTest`)

### Frontend
- ✅ Page `/admin/btp-rh` — KPIs, export CSV, gestion des échéances (CRUD complet avec édition inline)
- ✅ Page `/admin/role-scopes` — configuration des politiques d'accès documentaire par rôle
- ✅ Sélecteur de type d'heure dans la section time tracking de la fiche projet
- ✅ Accès ROLE_RH à `/admin/btp-rh` sans droits admin complets (garde de route corrigée)
- ✅ Redirection post-login vers `/admin/btp-rh` pour les utilisateurs ROLE_RH (sans ROLE_ADMIN)

---

## Phase 9 — Absences RH & Notifications _(branche `feat/roadmap-phase-9`)_

### Backend
- ✅ Entité `Leave` (employé, type, statut, dates, motif, validé par, `workingDays` calculé)
- ✅ Enums `LeaveType` (paid_vacation, rtt, sick, training, other) et `LeaveStatus` (pending, approved, rejected, cancelled)
- ✅ `LeaveController` — CRUD + actions `/approve` / `/reject` + validation chevauchements — accès `ROLE_RH`
- ✅ `LeaveRepository::findFiltered` (employeeId, companyId, status, type) + `hasOverlap` + `countPendingAll`
- ✅ `NotificationService` — email Symfony Mailer : statut congé + alerte échéance conformité
- ✅ Migration `Version20260531100000` (table `employee_leave`)
- ✅ Tests fonctionnels `LeaveCrudTest` (CRUD, approve/reject, access control, jours ouvrés)

### Frontend
- ✅ Types `LeaveType`, `LeaveStatus`, `ApiLeave` (avec `workingDays`) + `leavesApi` dans `lib/api.ts`
- ✅ Hooks TanStack Query : `useLeavesQuery`, `useCreateLeaveMutation`, `useApproveLeave`, `useRejectLeave`, `useDeleteLeaveMutation`
- ✅ Page `/admin/leaves` — vues Liste & Calendrier mensuel, filtres companyId/employeeId/statut/type, badge compteur en attente
- ✅ Section absences dans la fiche employé `/admin/employees/[id]` (listing + formulaire)
- ✅ Entrée "Absences" dans la sidebar admin
- ✅ i18n FR/EN du module absences

---

## Phase 10 — Améliorations transversales _(branche `feat/roadmap-phase-10`)_

### Backend — Correctifs & Sécurité
- ✅ Type safety `instanceof User` dans `LeaveController::approve/reject` (fix type PHPStan)
- ✅ Validation chevauchements d'absences (backend + UX)
- ✅ `workingDays` exposé dans la sérialisation `Leave` (calcul côté serveur)
- ✅ Rate limiting sur `/auth/login` — 10 req/min par IP (Symfony `RateLimiterFactory` + `LoginRateLimitListener`)

### Backend — Nouvelles métriques
- ✅ `TimeEntryRepository::sumActualLaborCostCents` — coût MO réel (heures × taux journalier)
- ✅ `LeaveRepository::countPendingAll` — congés en attente global
- ✅ `BtpExecutiveDashboardController` enrichi : `actualLaborCostCents`, `marginCents` (CA − MO), `pendingLeavesCount`
- ✅ SLA Tickets : champs `firstResponseAt`, `resolvedAt` + `firstResponseMinutes`, `resolutionMinutes` sur `Ticket`
- ✅ `TicketController` : auto-remplissage `firstResponseAt` au premier commentaire staff
- ✅ Migration `Version20260531110000` (colonnes SLA sur `ticket`)

### Frontend — UX
- ✅ Dashboard BTP : 2 nouvelles cartes KPI (Coût MO réel, Marge CA−MO colorée, Congés en attente)
- ✅ Détail ticket `/admin/tickets/[id]` — bloc SLA (créé, première réponse, résolu, durées en minutes)
- ✅ Page `/admin/leaves` — calendrier mensuel visuel avec navigation mois, légende, code couleur statuts
- ✅ `/admin/leaves` — filtres entreprise et employé exposés dans l'UI
- ✅ `/admin/employees/[id]` — section absences (liste + formulaire d'ajout inline)
- ✅ i18n FR/EN : clés SLA tickets + nouvelles métriques BTP

---

## Phase 11 — Améliorations espace développeur

### Correctifs
- ✅ Dashboard dev : comparaison `user.id` au lieu de `user.email` pour les tickets assignés
- ✅ Dashboard dev : statut `in_review` inclus dans le décompte "mes tickets actifs"

### Fonctionnel
- ✅ Kanban `/dev/tickets` — filtres : mes tickets, priorité, type, recherche textuelle
- ✅ Kanban `/dev/tickets` — bouton "Nouveau ticket" intégré (réutilise `TicketCreateForm`)
- ✅ Notification email automatique à l'assignation d'un ticket (création + changement d'assignee)
- ✅ Badge rouge sur les cartes kanban pour les tickets urgents/high sans première réponse
- ✅ Dashboard dev — section "Urgents sans réponse" avec âge d'attente
- ✅ Dashboard dev — section "Résolutions récentes" avec durée de résolution SLA
- ✅ i18n FR/EN : toutes les nouvelles clés

---

## Phase 12 — Workflow BTP 15 étapes

### Backend
- ✅ Enum `ProjectPipelineStage` remplacé : 5 étapes génériques → 15 étapes BTP séquentielles
- ✅ Entité `Project` : nouveau champ `stageChangedAt` (mis à jour automatiquement à chaque transition)
- ✅ Entité `ProjectStageHistory` + repository : audit trail complet (fromStage, toStage, changedBy, changedAt)
- ✅ `ProjectStageController` : `POST /api/projects/{id}/stage/advance` avec validation de rôle par étape
- ✅ `GET /api/projects/{id}/stage/history` : historique des transitions
- ✅ Règles de transition par rôle : comptabilité (ROLE_RH), technique (ROLE_ENGINEER), admin (ROLE_ADMIN)
- ✅ Migration `Version20260531120000` : remap des données existantes (5 → 15 valeurs) + colonne `stage_changed_at`
- ✅ Migration `Version20260531130000` : table `project_stage_history`

### Les 15 étapes
1. `contact` — Prise de contact (ADMIN)
2. `meeting` — Rencontre client (ADMIN)
3. `engineer_assigned` — Prise par un ingénieur (ADMIN, ENGINEER)
4. `quote_plan` — Plan pour devis (ADMIN, ENGINEER)
5. `quote_signed` — Signature du devis (ADMIN)
6. `invoice_sent` — Facture envoyée (ADMIN, RH)
7. `deposit_received` — Acompte reçu (ADMIN, RH)
8. `design_started` — Début dessin architecte (ADMIN, ENGINEER)
9. `design_completed` — Fin du dessin (ADMIN, ENGINEER)
10. `client_signed` — Signature client (ADMIN)
11. `components_ordered` — Commande des composants (ADMIN, ENGINEER)
12. `construction` — Montage de la maison (ADMIN, ENGINEER)
13. `subcontractors` — Intervention sous-traitants (ADMIN)
14. `site_visit` — Visite (ADMIN, ENGINEER)
15. `paid` — Paiement total — étape terminale (ADMIN, RH)

### Frontend
- ✅ `ProjectPipelineStage` type : 15 valeurs, `ApiStageHistory`, `projectsApi.advanceStage/stageHistory`
- ✅ `pipeline-label.ts` : `PIPELINE_STAGES`, `TRANSITION_ROLES` (miroir du backend)
- ✅ `i18n.ts` FR/EN : 15 labels + clés bouton/historique/permission
- ✅ Hooks `useAdvanceStageMutation`, `useStageHistoryQuery`
- ✅ Composant `ProjectStageStepper` : stepper horizontal scrollable, bouton "Avancer vers", historique
- ✅ `/admin/projects/[id]` : stepper en tête de page + override manuel admin (select caché)
- ✅ Filtre pipeline sur `/admin/projects` : 15 nouvelles valeurs
- ✅ `btp-rh/page.tsx` : `PIPELINE_ORDER` mis à jour (15 entrées)

---

## Phase 13 — Améliorations transversales (suite Phase 12)

### Backend Symfony
- ✅ `NotificationService::sendStageAdvancedNotification()` — email client à chaque avancement d'étape (avec note optionnelle)
- ✅ `ProjectStageHistory` : champ `note` (texte nullable) enregistré à chaque transition
- ✅ Migration `Version20260531140000` — ajout colonne `note` sur `project_stage_history`
- ✅ `ProjectStageController::checklist()` — `GET /api/projects/{id}/stage/checklist` : liste statique d'actions par étape avec statut calculé
- ✅ `StageChecklistService` — logique de calcul du statut checklist (devis, factures, documents, employés)
- ✅ `PdfController::projectReport()` — `GET /api/pdf/projects/{id}/report` : rapport HTML/PDF d'avancement
- ✅ Template Twig `pdf/project_report.html.twig` — pipeline, KPIs, timeline historique, notes
- ✅ Pagination API : paramètres `page` / `perPage` + header `X-Total-Count` sur projets, tickets, absences
- ✅ Tests PHPUnit `ProjectStageCrudTest` — 8 cas couvrant advance, note, RBAC, terminal, historique, 404

### Frontend Next.js
- ✅ `ProjectStageReadOnly` — composant barre de progression + dots pour espaces client et sous-traitant
- ✅ `ProjectStageStepper` : champ `note` avant avancement + affichage des notes dans l'historique
- ✅ `ProjectStageStepper` : section checklist par étape avec indicateurs complété/incomplet
- ✅ Kanban projets `/admin/projects/kanban` — colonnes par étape, drag-and-drop optimiste (dnd-kit), lien dans nav
- ✅ Bouton "Rapport PDF" dans la page de détail projet admin
- ✅ Hook `useStageChecklistQuery` + `projectsApi.stageChecklist()`
- ✅ `api.ts` : `ApiStageHistory.note`, `advanceStage(id, note?)`, `stageChecklist(id)`
- ✅ i18n : `notePlaceholder`, `kanban`, `listView`, clés kanban FR/EN

---

## Transversal (toutes phases)

- ✅ README frontend (remplacer le stub create-next-app)
- ✅ CI/CD (GitHub Actions : lint, tests, build)
- ✅ Redis (cache Symfony + transport Messenger)
- ✅ Tests E2E frontend (Playwright — config + suites auth & navigation)
- ✅ Tests d'intégration backend (PHPUnit — flux auth, tickets, devis, sous-traitant, BTP/RH)
- ✅ Monitoring / logging (Sentry prêt à l'emploi — activer via `SENTRY_DSN` + `composer require sentry/sentry-symfony`)
- ⬜ Documentation API complète (API Platform / Swagger) — auto-générée via `/api/docs`, enrichissement manuel à faire
