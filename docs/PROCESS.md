# LOGIQUE MÉTIER : PROCESSUS DE VALIDATION DES OFFRES (V6)

Ce document définit le workflow strict que l'outil "Vision" doit piloter. Chaque étape possède ses propres acteurs, critères de succès et délais (SLA).

## LÉGENDE DES RÔLES
- **R** : Responsable (celui qui pilote l'étape)
- **A** : Acteur (celui qui réalise)
- **C** : Consulté (avis requis)
- **I** : Informé (notification uniquement)

---

## ÉTAPE 0 : DÉTECTION
* **Qui** : Commercial et/ou Technique.
* **Quoi** : Identification d'un besoin ou d'une opportunité technologique.
* **Comment** : Identification du besoin par le service commercial ou technique.
* **Action Système** : Formulaire de création d'une "Opportunité d'Offre".

## ÉTAPE 1 : ANALYSE (GO / NO-GO)
* **Qui** : BEE (R), Commerce (C), Resp BE (C).
* **Quoi** : Analyse de la viabilité de la solution.
* **Comment (Checklist)** :
    * **Potentiel de l'offre** : Fréquence du besoin (O/N), Adapté cible client (O/N), Rapport prix/bénéfice, Besoin récurrent (O/N), Impact formation interne, Mutualisation clients.
    * **Potentiel partenaire** : Accompagnement commercial/technique, Qualité du support.
* **Quand** : 3 semaines Max.
* **Logique** : Si "OK" -> Passage à l'Etape 2. Si "Non" -> Archivage avec motif (Historique).

## ÉTAPE 2 : CAHIER DES CHARGES & MAQUETTAGE
* **Qui** : 
    * Cahier des charges : BEE (A).
    * Maquettage : CDP (R), Maquettage Technique (A), NAE (I).
* **Quoi** : Rédaction technique et test en labo.
* **Comment** :
    * **Cahier des charges** : Test de facilité de mise en œuvre, conformité fonctionnalités, ergonomie console, exigences infogérance.
    * **Maquettage** : Test en lab/Benchmark, retour du CDC avec validation point par point, création de procédures, définition du temps d'installation.
* **Quand** : 1 semaine (CDC) + 6 semaines (Maquettage).

## ÉTAPE 3 : CRÉATION DE L'OFFRE COMMERCIALE
* **Qui** : BEE (R), Marketing (A), Administratif (A), Juridique (A), Commerce (C).
* **Quoi** : Construction du "Pack" commercial.
* **Comment** :
    * Négociation modalités commerciales partenaire.
    * Création de la grille tarifaire (transmise à l'Admin).
    * Rédaction de la plaquette (Marketing).
    * Création des slides de présentation.
    * Rédaction du contrat (Juridique).
    * Création de la proposition commerciale type.
* **Quand** : 6 semaines Max.

## ÉTAPE 4 : VALIDATION DE L'OFFRE (GATEKEEPER)
* **Qui** : CDP (R), Admin (A), Juridique (A), NAE (A), BEE (C), Tech Déploiement (I), Tech Hotline (I).
* **Quoi** : 4 points de validation obligatoires avant mise sur le marché.
* **Logique de Validation** :
    1.  **Administratif** : Validation BIC (O/N).
    2.  **Juridique** : Validation contrat final (O/N).
    3.  **Technique Déploiement** : Validation process install (O/N).
    4.  **Technique Hotline** : Validation supportabilité (O/N).
* **Action si "NON"** : Identification des blocages -> Retour à l'étape correspondante pour correction.
* **Action si "OUI"** : Création du groupe de travail / Équipe Teams.
* **Quand** : 2 semaines Max.

## ÉTAPE 5 : COMMERCIALISATION
* **Qui** : CDP (R), BEE (A), Tech Déploim. (A), Tech Hotline (A).
* **Quoi** : Lancement officiel.
* **Comment** :
    * Communication via newsletter interne.
    * Formation des équipes commerciales (Flash info / Réunion).
    * Adaptation de la stratégie de formation.
    * Mise en production de la première installation.
    * Validation/Correction des procédures post-première install.
* **Quand** : 6 semaines Max.

## ÉTAPE 6 : SUIVI
* **Qui** : BEE (R), Tech Déploim. (A), Tech Hotline (A), Commerciaux (A).
* **Quoi** : Maintien en conditions opérationnelles de l'offre.
* **Comment** :
    * Veille technologique sur le maintien de la pertinence.
    * Veille sur les nouvelles fonctionnalités.
    * Remontées de pertinence du terrain (Commerciaux).
    * MAJ des procédures (Déploiement).
    * Remontée des incidents majeurs (Hotline).