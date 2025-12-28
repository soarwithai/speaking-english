import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// 初始化 Gemini Client
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenerativeAI(apiKey);

// 模型优先列表：强 -> 快 -> 备用
const TEXT_MODELS = ["gemini-1.5-pro", "gemini-2.0-flash", "gemini-1.5-flash"];

/**
 * 使用 fallback 策略和指数退避生成内容
 */
async function generateWithFallback(contents: string, config: any) {
  let lastError: any = null;

  for (let i = 0; i < TEXT_MODELS.length; i++) {
    const modelName = TEXT_MODELS[i];
    try {
      if (i > 0) {
        const waitTime = 1000 * Math.pow(2, i - 1);
        console.log(`[Backoff] 切换到 ${modelName} 等待 ${waitTime}ms`);
        await new Promise((r) => setTimeout(r, waitTime));
      }

      const model = ai.getGenerativeModel({ model: modelName, generationConfig: config });
      const result = await model.generateContent(contents);
      const response = await result.response;

      return { response, active_model: modelName };
    } catch (error: any) {
      console.warn(`模型 ${modelName} 失败:`, error.message);
      lastError = error;
      const status = error.status || error.response?.status;
      if (status && status !== 429 && status !== 503) {
        throw error;
      }
    }
  }

  throw lastError || new Error("所有模型均失败");
}

/**
 * Pages Router API Handler
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY 缺失" });
  }

  const { task, ...payload } = req.body;

  try {
    let prompt = "";
    let config: any = {};

    switch (task) {
      case "free-talk":
        prompt = `Translate the following Chinese context/sentence into English in three distinct styles:
1. Simple/Common
2. Formal
3. British Slang
Input Context: "${payload.input}"`;

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
        prompt = `You are a roleplay engine. Create a short roleplay scenario for a Chinese student studying Mathematics in the UK.
Topic: "${payload.topic}"
Difficulty: "${payload.difficulty}"
1. Brief setting description
2. Opening question for the student (do NOT provide answer)`;

        config = {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              topic: { type: SchemaType.STRING },
              description: { type: SchemaType.STRING },
              question: { type: SchemaType.STRING },
            },
            required: ["topic", "description", "question"],
          },
        };
        break;

      case "evaluate":
        prompt = `Context: A Mathematics student in the UK.
Scenario: ${payload.scenario.description}
Question: "${payload.scenario.question}"
Student Answer: "${payload.userSpeech}"
Task:
1. Give a score (0-10)
2. Provide critique
3. Better Example
4. Cultural Note`;

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
        prompt = `Translate "${payload.word}" into Chinese.
Context: "${payload.context}".
Return ONLY translation and Pinyin, e.g., 苹果 (Píngguǒ).`;
        config = {};
        break;

      default:
        return res.status(400).json({ error: "Invalid task type" });
    }

    // 调用 Gemini
    const { response, active_model } = await generateWithFallback(prompt, config);

    // 处理返回
    let result: any = {};
    if (task === "translate") {
      result = { translation: response.text()?.trim() || "Translation not found" };
    } else {
      try {
        result = JSON.parse(response.text());
      } catch (e) {
        console.error("JSON 解析失败", response.text());
        throw new Error("Invalid JSON response from model");
      }
    }

    return res.status(200).json({ ...result, active_model });
  } catch (error: any) {
    console.error("API Chat Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
