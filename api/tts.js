import { GoogleGenAI, Modality } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });
const TTS_MODEL = "gemini-2.5-flash-preview-tts";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Server configuration error: GEMINI_API_KEY missing' });
    }

    try {
        const { text, voice } = req.body;
        
        const response = await ai.models.generateContent({
            model: TTS_MODEL,
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voice || 'Puck' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        
        if (!base64Audio) {
            throw new Error("No audio data received from upstream");
        }

        return res.status(200).json({ audio: base64Audio, active_model: TTS_MODEL });

    } catch (error) {
        console.error("TTS Error:", error);
        // Fallback or retry logic isn't as critical for TTS usually, but could be added.
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}