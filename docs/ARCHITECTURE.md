# Spécifications Techniques

## Environnement
- **Serveur** : VPS OVH (6 vCores, 12Go RAM, 100Go SSD).
- **OS** : Debian + Docker.
- **Proxy** : Traefik v3.1 déjà configuré.

## Configuration Docker (Impératif)
- **Network** : `audit-app_web` (externe).
- **Labels Traefik** :
  - `traefik.http.routers.vision.rule=Host(`vision.alsek.fr`)`
  - `traefik.http.routers.vision.entrypoints=websecure`
  - `traefik.http.routers.vision.tls.certresolver=letsencrypt`

## Stack Recommandée
- **Frontend/Backend** : Next.js 14+ (App Router).
- **Base de données** : PostgreSQL.
- **IA** : SDK Google Generative AI (Gemini).
- **Tâches de fond** : Cron ou Worker pour les flux RSS.

## Sécurité & Authentification
- **Framework** : NextAuth.js v5.
- **Stratégie** : Database Strategy (session stockée en BDD).
- **Provider** : Credentials Provider (Email/Password) pour un accès sécurisé interne.
- **Middleware** : Protection de toutes les routes `/api/*` et `/dashboard/*`.