import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface Article {
  title: string;
  summary: string;
  url: string;
  source: string;
  academicContext: string;
}

export async function fetchDailyArticles(): Promise<Article[]> {
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const prompt = `Aujourd'hui nous sommes le ${today}.
Cherche sur le web exactement 9 articles de presse publiés très récemment (idéalement aujourd'hui, sinon dans les dernières 48h).
CRITÈRE STRICT SUR LE SUJET : Les articles doivent OBLIGATOIREMENT parler de psychologie ET de relations de couple (romantic relationships, couples therapy, dating psychology, etc.). Ne choisis aucun article qui ne traite pas spécifiquement de la dynamique de couple.
CRITÈRE STRICT SUR LA LANGUE : Les articles originaux doivent IMPÉRATIVEMENT avoir été écrits dans une autre langue que le français (par exemple en anglais, espagnol, allemand, etc.). Ne choisis AUCUN article dont la langue d'origine est le français.
Ces articles doivent impérativement être liés à de la recherche académique ou scientifique.
Cependant, tu dois traduire et rédiger toutes tes réponses (titre, résumé, contexte) en français.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview", // Modèle plus rapide
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Le titre de l'article traduit en français" },
            summary: { type: Type.STRING, description: "Un résumé clair et engageant en français (environ 2-3 phrases)" },
            url: { type: Type.STRING, description: "Le lien vers l'article original (qui est dans une langue étrangère)" },
            source: { type: Type.STRING, description: "Le nom du média ou du journal" },
            academicContext: { type: Type.STRING, description: "Une courte phrase en français expliquant le lien avec la recherche académique" }
          },
          required: ["title", "summary", "url", "source", "academicContext"]
        }
      }
    }
  });

  if (!response.text) {
    throw new Error("Aucune réponse reçue de l'API.");
  }

  try {
    const articles: Article[] = JSON.parse(response.text);
    return articles.slice(0, 9);
  } catch (e) {
    console.error("Erreur de parsing JSON:", response.text);
    throw new Error("Erreur lors du formatage des résultats. Veuillez réessayer.");
  }
}
