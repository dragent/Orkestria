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

* fiche employé (rôle, compétences, coût)
* assignation aux projets
* suivi du temps (time tracking)
* analyse de performance

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
docker-compose up --build
```

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
