# Vision - Plateforme de pilotage Veille & Offres

Vision est un SaaS interne conçu pour Alsek ESN. Il permet de centraliser la veille technologique via des flux RSS, d'utiliser l'IA pour générer des idées d'offres, et de piloter le cycle de vie complet de la création d'une offre (de la détection jusqu'au suivi).

## 🚀 Fonctionnalités Clés

- **Veille Automatisée** : Ingestion automatique de flux RSS (LeMagIT, Cigref, O365 Reports, etc.) classés par catégories.
- **Détection IA (Gemini)** : Analyse de la pertinence des articles et génération de brouillons d'offres commerciales packagées.
- **Workflow Strict (7 étapes)** : Suivi granulaire de l'avancement d'une offre (Détection -> Analyse -> CDC -> Commercialisation...).
- **Suivi des SLA** : Alertes visuelles (Retard, SLA Dépassé) si une étape prend trop de temps.
- **Chatbot RAG** : Assistant IA interne capable de répondre aux questions sur l'état des offres en cours.
- **Historique** : Traçabilité des offres non retenues avec leurs motifs de rejet.

## 🛠 Stack Technique

- **Frontend / Backend** : Next.js 14 (App Router), React, Tailwind CSS
- **Base de données** : PostgreSQL 16
- **ORM** : Prisma
- **Authentification** : NextAuth.js v5 (Credentials)
- **Intelligence Artificielle** : Google Generative AI SDK (Gemini 2.0 Flash)
- **Déploiement** : Docker, Docker Compose, Traefik v3.1

---

## ⚙️ Installation & Déploiement (VPS Debian)

Le projet est conçu pour être déployé facilement via Docker Compose derrière un proxy Traefik.

### 1. Prérequis sur le serveur
- Docker et Docker Compose installés.
- Traefik configuré avec le réseau externe `audit-app_web`.

### 2. Configuration

Clonez le dépôt sur votre serveur :
```bash
git clone <votre-repo-url> /opt/vision
cd /opt/vision
```

Créez le fichier d'environnement :
```bash
cp .env.example .env
```

Éditez le fichier `.env` pour renseigner vos variables critiques :
- `DB_PASSWORD` : Choisissez un mot de passe fort pour PostgreSQL.
- `GEMINI_API_KEY` : Votre clé API Google AI.
- `NEXTAUTH_SECRET` : Générez un secret (ex: `openssl rand -base64 32`).

### 3. Démarrage

Lancez les conteneurs en tâche de fond :
```bash
docker compose up -d --build
```
*Le container `vision-app` va automatiquement exécuter les migrations de base de données à son premier démarrage (via `docker-entrypoint.sh`).*

### 4. Initialisation des données (Seed)

Pour créer les catégories, les flux RSS par défaut et le compte administrateur, exécutez :
```bash
docker exec vision-app npx prisma db seed
```

---

## 🔐 Accès et Utilisation

Une fois déployé, l'application est accessible sur : **https://vision.alsek.fr**

### Identifiants par défaut :
- **Email** : `admin@alsek.fr`
- **Mot de passe** : `VisionAlsek2026!`

*(⚠️ Il est fortement recommandé de changer ce mot de passe ou de créer un nouvel administrateur dès la première connexion).*

## 📡 Tâches planifiées (Cron)
L'ingestion des flux RSS se fait automatiquement toutes les 2 heures via un script interne déclenché par l'instrumentation de Next.js.
Vous pouvez également forcer l'actualisation manuellement depuis la page "Veille Technologique".
