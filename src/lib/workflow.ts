// Step definitions with pre-defined actions for the offer workflow
// Imported from prisma/seed.ts pattern

export const STEP_DEFINITIONS = [
  {
    stepNumber: 0,
    stepName: "Détection",
    responsibleRole: "Commercial / Technique",
    slaWeeks: null,
    weight: 5,
    actions: [
      { label: "Identification du besoin", responsible: "Commercial/Technique" },
      { label: "Création opportunité", responsible: "Commercial/Technique" },
    ],
  },
  {
    stepNumber: 1,
    stepName: "Analyse (Go/NoGo)",
    responsibleRole: "BEE",
    slaWeeks: 3,
    weight: 10,
    actions: [
      { label: "Fréquence du besoin client", responsible: "BEE" },
      { label: "Adapté à la cible client", responsible: "BEE" },
      { label: "Rapport prix / bénéfice", responsible: "BEE" },
      { label: "Besoin récurrent identifié", responsible: "BEE" },
      { label: "Impact formation interne", responsible: "BEE" },
      { label: "Possibilité de mutualisation", responsible: "BEE" },
      { label: "Évaluation accompagnement partenaire", responsible: "BEE" },
      { label: "Qualité du support partenaire", responsible: "BEE" },
      { label: "Décision Go / NoGo", responsible: "LDS" },
    ],
  },
  {
    stepNumber: 2,
    stepName: "Cahier des charges & Maquettage",
    responsibleRole: "CDP",
    slaWeeks: 7,
    weight: 15,
    actions: [
      { label: "Rédaction du cahier des charges", responsible: "BEE" },
      { label: "Test de facilité de mise en œuvre", responsible: "BEE" },
      { label: "Conformité fonctionnalités annoncées", responsible: "BEE" },
      { label: "Ergonomie de la console", responsible: "BEE" },
      { label: "Exigences infogérance/administration", responsible: "BEE" },
      { label: "Sollicitation des RFI", responsible: "BEE" },
      { label: "Test en lab / Benchmark technique", responsible: "Technique" },
      { label: "Validation point par point du CDC", responsible: "Technique" },
      { label: "Création des procédures", responsible: "Technique" },
      { label: "Définition du temps d'installation", responsible: "Technique" },
    ],
  },
  {
    stepNumber: 3,
    stepName: "Création de l'offre commerciale",
    responsibleRole: "BEE",
    slaWeeks: 6,
    weight: 20,
    actions: [
      { label: "Négociation modalités partenaire", responsible: "BEE" },
      { label: "Création de la grille tarifaire", responsible: "BEE" },
      { label: "Transmission grille à l'Administratif", responsible: "BEE" },
      { label: "Sollicitation Marketing - Plaquette", responsible: "Marketing" },
      { label: "Rédaction de la plaquette", responsible: "Marketing" },
      { label: "Création des slides de présentation", responsible: "BEE" },
      { label: "Finalisation de la grille tarifaire", responsible: "Administratif" },
      { label: "Rédaction du contrat", responsible: "Juridique" },
      { label: "Création proposition commerciale type", responsible: "Commerce" },
    ],
  },
  {
    stepNumber: 4,
    stepName: "Validation de l'offre (Gatekeeper)",
    responsibleRole: "CDP",
    slaWeeks: 2,
    weight: 15,
    actions: [
      { label: "Validation Administratif (BIC)", responsible: "Administratif" },
      { label: "Validation Juridique (contrat final)", responsible: "Juridique" },
      { label: "Validation Technique Déploiement (process)", responsible: "Tech Déploiement" },
      { label: "Validation Technique Hotline (supportabilité)", responsible: "Tech Hotline" },
      { label: "Création du groupe de travail / Équipe Teams", responsible: "CDP" },
    ],
  },
  {
    stepNumber: 5,
    stepName: "Commercialisation",
    responsibleRole: "CDP",
    slaWeeks: 6,
    weight: 20,
    actions: [
      { label: "Communication via newsletter interne", responsible: "BEE" },
      { label: "Formation des équipes commerciales", responsible: "BEE" },
      { label: "Adaptation stratégie de formation", responsible: "NAC / BEE" },
      { label: "Planification 1ère installation", responsible: "CDP" },
      { label: "Mise en production 1er client", responsible: "Service Technique" },
      { label: "Validation / Correction des procédures", responsible: "Service Technique" },
    ],
  },
  {
    stepNumber: 6,
    stepName: "Suivi",
    responsibleRole: "BEE",
    slaWeeks: null,
    weight: 15,
    actions: [
      { label: "Veille pertinence de la solution", responsible: "BEE" },
      { label: "Veille nouvelles fonctionnalités", responsible: "BEE" },
      { label: "Veille produits marché", responsible: "BEE" },
      { label: "Remontées pertinence terrain", responsible: "Commerciaux" },
      { label: "MAJ procédures évolutions", responsible: "Service Déploiement" },
      { label: "Suivi incidents majeurs", responsible: "Service Hotline" },
    ],
  },
];

export function calculateOfferProgress(
  steps: { stepNumber: number; status: string; actions: { status: string }[] }[]
): number {
  let totalProgress = 0;

  for (const stepDef of STEP_DEFINITIONS) {
    const step = steps.find((s) => s.stepNumber === stepDef.stepNumber);
    if (!step) continue;

    if (step.status === "completed") {
      totalProgress += stepDef.weight;
    } else if (step.status === "in_progress") {
      const completedActions = step.actions.filter(
        (a) => a.status === "completed"
      ).length;
      const totalActions = step.actions.length || 1;
      totalProgress += stepDef.weight * (completedActions / totalActions);
    }
  }

  return Math.round(totalProgress);
}
