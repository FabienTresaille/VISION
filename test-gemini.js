const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ Erreur : GEMINI_API_KEY n'est pas définie !");
    process.exit(1);
  }

  try {
    console.log("🔍 Récupération des modèles disponibles pour votre clé API...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const text = await response.text();
      console.error(`❌ Erreur de l'API (${response.status}) :`, text);
      return;
    }

    const data = await response.json();
    console.log("\n✅ Modèles disponibles :");
    
    // Filtrer pour ne garder que les modèles utiles à notre cas (text generation / chat)
    const chatModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
    
    chatModels.forEach(model => {
      console.log(`- Nom : ${model.name}`);
      console.log(`  Version : ${model.version}`);
      console.log(`  Description : ${model.description.substring(0, 80)}...`);
      console.log("---------------------------------------------------");
    });

  } catch (error) {
    console.error("❌ Erreur de connexion :", error);
  }
}

listModels();
