# Product Requirements Document - VISION

## Vision
Outil centralisé pour Alsek permettant de transformer la veille technologique en opportunités business (offres packagées) et de suivre leur validation.

## Fonctionnalités Clés
1. **Dashboard Accueil** :
   - KPI : Nombre de solutions en cours d'étude.
   - Liste des solutions "Non retenues" avec historique des motifs.
   - Bouton "Demande de test" (Formulaire).
2. **Agent IA de Veille (RSS)** :
   - Ingestion de flux RSS.
   - Auto-tagging selon `CATEGORIES.md`.
   - Analyse de pertinence via Gemini.
3. **Détection d'Offres** :
   - Page dédiée listant les nouveautés RSS.
   - Bouton "Générer idée d'offre" : L'IA rédige un draft de pack commercial (service + récurrent).
4. **Suivi du Processus** :
   - Gestion des étapes 0 à 6 (voir `PROCESS.md`).
5. **Chatbot Vision** :
   - Interface type chat (bas droite).
   - RAG (Retrieval Augmented Generation) sur la base de données des offres.
   - Capable de dire où en est une offre et pourquoi elle bloque.