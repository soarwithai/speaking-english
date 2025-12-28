import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// Priority List: Strongest -> Fastest -> Fallback
const TEXT_MODELS = ["gemini-1.5-pro", "gemini-2.0-flash", "gemini-1.5-flash"];

/**
 * Execute generation with fallback strategy and exponential backoff.
 */
async function generateWithFallback(contents, config) {
    let lastError = null;

    for (let i = 0; i < TEXT_MODELS.length; i++) {
        const modelName = TEXT_MODELS[i];
        
        try {
            // Exponential backoff: Wait 1s, 2s, 4s... before retries (if not first attempt)
            if (i > 0) {
                const waitTime = 1000 * Math.pow(2, i - 1);
                console.log(`[Backoff] Switching to ${modelName} after ${waitTime}ms delay...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }

            const response = await ai.models.generateContent({
                model: modelName,
                contents,
                config
            });

            return { response, active_model: modelName };

        } catch (error) {
            console.warn(`Model ${modelName} failed:`, error.message);
            lastError = error;
            
            // Check for retryable status codes (429: Too Many Requests, 503: Service Unavailable)
            const status = error.status || error.response?.status;
            const isRetryable = status === 429 || status === 503;

            // If not retryable, throw immediately
            if (!isRetryable && status) {
                 throw error;
            }
            
            if (i === TEXT_MODELS.length - 1) {
                console.error("All fallback models exhausted.");
            }
        }
    }
    throw lastError || new Error("All models failed to generate content.");
}

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Server configuration error: GEMINI_API_KEY missing' });
    }

    const { task, ...payload } = req.body;

    try {
        let prompt = '';
        let config = {};

        // 1. Construct Prompt & Schema based on Task
        switch (task) {
            case 'free-talk':
                prompt = `Translate the following Chinese context/sentence into English in three distinct styles:
                1. Simple/Common: Everyday language.
                2. Formal: Suitable for academic or business settings.
                3. British Slang/Idiomatic: How a local young person in the UK might say it.
                Input Context: "${payload.input}"`;
                
                config = {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            simple: { type: Type.STRING },
                            formal: { type: Type.STRING },
                            slang: { type: Type.STRING },
                        },
                        required: ["simple", "formal", "slang"],
                    },
                };
                break;

            case 'scenario':
                prompt = `You are a roleplay engine. Create a short roleplay scenario for a Chinese student studying Mathematics in the UK.
                The topic is: "${payload.topic}".
                Target Difficulty Level: "${payload.difficulty}".
                
                1. Provide a brief description of the setting.
                2. Provide a specific opening question or prompt that someone in this scenario asks the student.
                Do NOT provide the answer.`;
                
                config = {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            topic: { type: Type.STRING },
                            description: { type: Type.STRING },
                            question: { type: Type.STRING },
                        },
                        required: ["topic", "description", "question"],
                    },
                };
                break;

            case 'evaluate':
                prompt = `Context: A Mathematics student in the UK.
                Scenario: ${payload.scenario.description}
                Question asked to student: "${payload.scenario.question}"
                Student's Answer: "${payload.userSpeech}"

                Task:
                1. Give a score (0-10) based on relevance and grammar.
                2. Provide a critique (friendly but constructive).
                3. Provide a "Better Example" (What a native British speaker would say).
                4. Provide a "Cultural Note" explaining any relevant UK custom, etiquette, or slang related to this scenario.`;
                
                config = {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            score: { type: Type.NUMBER },
                            critique: { type: Type.STRING },
                            betterExample: { type: Type.STRING },
                            culturalNote: { type: Type.STRING },
                        },
                        required: ["score", "critique", "betterExample", "culturalNote"],
                    },
                };
                break;

            case 'translate':
                prompt = `Translate the English word or phrase "${payload.word}" into Chinese.
                Context: "${payload.context}".
                Return ONLY the Chinese translation and Pinyin in brackets. Example: 苹果 (Píngguǒ).
                Keep it concise.`;
                config = {}; // Plain text response is fine
                break;

            default:
                return res.status(400).json({ error: 'Invalid task type' });
        }

        // 2. Call Gemini with Fallback
        const { response, active_model } = await generateWithFallback(prompt, config);

        // 3. Process Response
        let result = {};
        
        if (task === 'translate') {
            result = { translation: response.text?.trim() || "Translation not found." };
        } else {
            // Parse JSON response for structured tasks
            try {
                result = JSON.parse(response.text);
            } catch (e) {
                console.error("Failed to parse JSON response", response.text);
                throw new Error("Invalid JSON response from model");
            }
        }

        // 4. Return Data
        return res.status(200).json({ 
            ...result, 
            active_model 
        });

    } catch (error) {
        console.error("API Chat Error:", error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}