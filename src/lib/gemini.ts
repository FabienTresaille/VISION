import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

// ─── AUTO-TAGGING ───────────────────────────────────────────

export async function analyzeArticle(
  title: string,
  summary: string,
  categories: { name: string; code: string; subCategories: { name: string; code: string }[] }[]
) {
  const categoriesDescription = categories
    .map(
      (c) =>
        `- ${c.code} (${c.name}): sous-catégories [${c.subCategories.map((s) => s.code).join(", ")}]`
    )
    .join("\n");

  const prompt = `Tu es un expert en veille technologique pour une ESN (Entreprise de Services Numériques).

Analyse cet article et détermine sa pertinence ainsi que ses catégories.

ARTICLE:
Titre: ${title}
Résumé: ${summary}

CATÉGORIES DISPONIBLES:
${categoriesDescription}

Réponds UNIQUEMENT en JSON valide avec ce format:
{
  "relevanceScore": <float entre 0 et 1>,
  "categories": [{"code": "<CODE_CATEGORIE>", "subCategories": ["<CODE_SOUS_CAT>"]}],
  "analysis": "<Résumé de 2-3 phrases sur la pertinence pour une ESN>"
}`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("Erreur Gemini (analyzeArticle):", error);
    return null;
  }
}

// ─── GÉNÉRATION D'OFFRE ─────────────────────────────────────

export async function generateOfferDraft(
  title: string,
  summary: string,
  categoryName: string
) {
  const prompt = `Tu es un expert commercial dans une ESN spécialisée en infrastructure IT et cybersécurité.

À partir de cette nouveauté technologique, rédige une idée d'offre packagée à proposer aux clients de l'ESN.

ARTICLE SOURCE:
Titre: ${title}
Résumé: ${summary}
Catégorie: ${categoryName}

L'offre doit:
1. Être un service récurrent (abonnement mensuel/annuel)
2. Apporter de la valeur ajoutée aux clients PME/ETI
3. S'intégrer dans le catalogue ISI (Infogérance Services Infrastructure)

Réponds UNIQUEMENT en JSON valide:
{
  "offerName": "<Nom de l'offre ISI ...>",
  "description": "<Description commerciale de 3-4 lignes>",
  "targetClients": "<Type de clients ciblés>",
  "recurringModel": "<Modèle de récurrence: mensuel/annuel/par poste...>",
  "estimatedPrice": "<Fourchette de prix indicative>",
  "keyBenefits": ["<Bénéfice 1>", "<Bénéfice 2>", "<Bénéfice 3>"],
  "technicalRequirements": "<Prérequis techniques>"
}`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("Erreur Gemini (generateOfferDraft):", error);
    return null;
  }
}

// ─── CHATBOT RAG ────────────────────────────────────────────

export async function chatWithContext(
  userMessage: string,
  context: {
    offers: { name: string; status: string; currentStep: number; progressPercent: number; rejectionReason?: string | null }[];
    recentArticles: { title: string; categories: string[] }[];
    stats: { totalOffers: number; inProgress: number; validated: number; rejected: number };
  }
) {
  const offersContext = context.offers
    .map(
      (o) =>
        `- "${o.name}" : Statut=${o.status}, Étape ${o.currentStep}/6, Progression=${o.progressPercent}%${o.rejectionReason ? `, Motif rejet: ${o.rejectionReason}` : ""}`
    )
    .join("\n");

  const articlesContext = context.recentArticles
    .slice(0, 10)
    .map((a) => `- "${a.title}" [${a.categories.join(", ")}]`)
    .join("\n");

  const systemPrompt = `Tu es l'assistant IA de Vision, l'outil de pilotage de veille technologique d'Alsek (ESN).

Tu as accès aux données suivantes:

STATISTIQUES:
- Total offres: ${context.stats.totalOffers}
- En cours: ${context.stats.inProgress}
- Validées: ${context.stats.validated}
- Rejetées: ${context.stats.rejected}

OFFRES EN BASE:
${offersContext || "Aucune offre enregistrée."}

ARTICLES RÉCENTS:
${articlesContext || "Aucun article récent."}

PROCESSUS DE VALIDATION (7 étapes):
0. Détection → 1. Analyse (Go/NoGo) → 2. CDC & Maquettage → 3. Offre commerciale → 4. Validation → 5. Commercialisation → 6. Suivi

Réponds de manière précise, concise et professionnelle en français.
Si on te demande où en est une offre, indique l'étape actuelle, le pourcentage et les actions restantes.
Si on te demande pourquoi une offre bloque, identifie l'étape en cours et les actions non complétées.`;

  try {
    const chat = geminiModel.startChat({
      history: [
        { role: "user", parts: [{ text: "Tu es l'assistant Vision." }] },
        { role: "model", parts: [{ text: "Compris, je suis l'assistant Vision d'Alsek. Comment puis-je vous aider ?" }] },
      ],
    });

    const result = await chat.sendMessage(`${systemPrompt}\n\nQuestion de l'utilisateur: ${userMessage}`);
    return result.response.text();
  } catch (error) {
    console.error("Erreur Gemini (chat):", error);
    return "Désolé, je rencontre une difficulté technique. Veuillez réessayer.";
  }
}
