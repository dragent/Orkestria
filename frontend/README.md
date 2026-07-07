# Orkestria — Frontend

Interface utilisateur de la plateforme Orkestria, construite avec **Next.js 16** (App Router), **TanStack Query** et **Tailwind CSS 4**.

---

## Stack technique

| Technologie | Version | Rôle |
|---|---|---|
| Next.js | 16.x | Framework React — App Router |
| React | 19.x | UI |
| Tailwind CSS | 4.x | Styles utilitaires |
| TanStack Query | 5.x | Fetch & cache serveur |
| Zustand | 5.x | État global léger |
| React Hook Form + Zod | — | Formulaires & validation |
| TypeScript | 5.x | Typage statique |

---

## Structure

```
frontend/
├── app/
│   ├── (auth)/          # Login, register, mot de passe oublié / reset
│   ├── admin/           # Espace administrateur
│   │   ├── users/       # Listing, création, détail utilisateur
│   │   ├── companies/   # CRUD entreprises
│   │   ├── clients/     # CRUD clients
│   │   ├── projects/    # CRUD projets + tâches, documents, devis
│   │   ├── employees/   # CRUD employés
│   │   └── role-scopes/ # Configuration des accès documentaires par rôle
│   ├── client/          # Espace client (projets, devis, factures)
│   ├── subcontractor/   # Espace sous-traitant (projets assignés, tâches)
│   └── page.tsx         # Page marketing
├── components/          # Composants partagés (ThemeToggle, LanguageToggle, FlashBag…)
├── contexts/            # theme-context, language-context
├── lib/
│   ├── api.ts           # Toutes les fonctions d'appel API typées
│   ├── hooks/queries.ts # Hooks TanStack Query (useXxxQuery, useXxxMutation)
│   ├── i18n.ts          # Traductions FR / EN
│   ├── stores/          # Stores Zustand (auth-store)
│   └── ...              # Utilitaires (pipeline-label, document-scope-label…)
└── public/              # Actifs statiques (logo, images)
```

---

## Variables d'environnement

| Variable | Description | Valeur par défaut |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL de l'API Symfony | `http://localhost:8080` |

---

## Démarrage

```bash
# Depuis la racine du projet (via Docker)
make up

# Ou en local
cd frontend
npm install
npm run dev
```

L'application est accessible sur **http://localhost:3000**.

---

## Authentification

L'authentification repose sur un JWT stocké dans `localStorage` (clé `orkestria_token`). Le guard de route est géré côté client via le layout de chaque espace (`/admin`, `/client`, `/subcontractor`).

---

## Espaces utilisateurs

| URL | Rôles | Description |
|---|---|---|
| `/admin` | `ROLE_ADMIN` | Tableau de bord, CRUD complet |
| `/client` | `ROLE_CLIENT` | Projets, validation de devis, factures |
| `/subcontractor` | `ROLE_SUBCONTRACTOR*` | Projets assignés, tâches |

---

## Thème

Le thème clair/sombre est géré via le contexte `useTheme()` et persiste dans `localStorage` sous la clé `orkestria-theme`. Les couleurs sont définies via des variables CSS (`--background`, `--foreground`, `--surface`, etc.) dans `globals.css`.

---

## Internationalisation

Les traductions FR/EN sont centralisées dans `lib/i18n.ts`. Le contexte `useLanguage()` expose `{ t, lang, setLang }`.
