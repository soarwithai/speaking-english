import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const ai = new GoogleGenerativeAI(apiKey);

// Priority List
const TEXT_MODELS = ["gemini-1.5-pro", "gemini-2.0-flash", "gemini-1.5-flash"];

async function generateWithFallback(contents: string, config: any) {
  let lastError: any = null;

  for (let i = 0; i < TEXT_MODELS.length; i++) {
    const modelName = TEXT_MODELS[i];

    try {
      if (i > 0) {
        const waitTime = 1000 * Math.pow(2, i - 1);
        await new Promise(r => setTimeout(r, waitTime));
      }

      const model = ai.getGenerativeModel({
        model: modelName,
        generationConfig: config,
      });

      const result = await model.generateContent(contents);
      return { response: result.response, active_model: modelName };

    } catch (err: any) {
      lastError = err;
      const status = err.status || err.response?.status;
      if (status && status !== 429 && status !== 503) {
        throw err;
      }
    }
  }

  throw lastError || new Error("All models failed");
}

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY missing" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { task, ...payload } = body;

    let prompt = "";
    let config: any = {};

    switch (task) {
      case "free-talk":
        prompt = `Translate the following Chinese context/sentence into English in three styles:
1. Simple
2. Formal
3. British Slang
Input: "${payload.input}"`;

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

      case "translate":
        prompt = `Translate "${payload.word}" into Chinese.
Context: "${payload.context}".
Return: 中文 (Pinyin).`;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid task type" },
          { status: 400 }
        );
    }

    const { response, active_model } = await generateWithFallback(prompt, config);

    let result: any;
    if (task === "translate") {
      result = { translation: response.text()?.trim() };
    } else {
      result = JSON.parse(response.text());
    }

    return NextResponse.json({ ...result, active_model });

  } catch (err: any) {
    console.error("Chat API Error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
