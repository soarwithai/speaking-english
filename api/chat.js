import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

/**
 * Vercel Serverless Function
 * Route: POST /api/chat
 */

const TEXT_MODELS = [
  "gemini-1.5-pro",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Gemini fallback + backoff
 */
async function generateWithFallback(prompt, config) {
  let lastError;

  for (let i = 0; i < TEXT_MODELS.length; i++) {
    const modelName = TEXT_MODELS[i];

    try {
      if (i > 0) {
        const delay = 1000 * Math.pow(2, i - 1);
        await new Promise(r => setTimeout(r, delay));
      }

      const model = ai.getGenerativeModel({
        model: modelName,
        generationConfig: config,
      });

      const result = await model.generateContent(prompt);
      return {
        text: result.response.text(),
        active_model: modelName,
      };

    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini models failed");
}

export default async function handler(request) {
  try {
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method Not Allowed" }),
        { status: 405 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY missing" }),
        { status: 500 }
      );
    }

    const body = await request.json();
    const { task, ...payload } = body;

    let prompt = "";
    let config = {};

    switch (task) {
      case "free-talk":
        prompt = `
Translate the following Chinese into English in three styles:
1. Simple/Common
2. Formal
3. British Slang

Input: "${payload.input}"
`;
        config = {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              simple: { type: SchemaType.STRING },
              formal: { type: SchemaType.STRING },
              slang: { type: SchemaType.STRING },
            },
            required: ["simple", "formal", "slang"],
          },
        };
        break;

      case "scenario":
        prompt = `
Create a short roleplay scenario for a Chinese Maths student in the UK.

Topic: "${payload.topic}"
Difficulty: "${payload.difficulty}"

Return:
- description
- question (do NOT answer)
`;
        config = {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              description: { type: SchemaType.STRING },
              question: { type: SchemaType.STRING },
            },
            required: ["description", "question"],
          },
        };
        break;

      case "evaluate":
        prompt = `
Scenario: ${payload.scenario.description}
Question: "${payload.scenario.question}"
Student Answer: "${payload.userSpeech}"

Give:
1. score (0-10)
2. critique
3. betterExample
4. culturalNote
`;
        config = {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              score: { type: SchemaType.NUMBER },
              critique: { type: SchemaType.STRING },
              betterExample: { type: SchemaType.STRING },
              culturalNote: { type: SchemaType.STRING },
            },
            required: ["score", "critique", "betterExample", "culturalNote"],
          },
        };
        break;

      case "translate":
        prompt = `
Translate "${payload.word}" into Chinese.
Context: "${payload.context}"
Return Chinese + Pinyin only.
`;
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Invalid task" }),
          { status: 400 }
        );
    }

    const { text, active_model } = await generateWithFallback(prompt, config);

    let data;
    try {
      data = task === "translate"
        ? { translation: text.trim() }
        : JSON.parse(text);
    } catch {
      throw new Error("Model returned invalid JSON");
    }

    return new Response(
      JSON.stringify({ ...data, active_model }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Server Error" }),
      { status: 500 }
    );
  }
}
