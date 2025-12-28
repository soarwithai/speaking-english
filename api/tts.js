// TTS functionality - using browser Web Speech API instead of server-side
// This endpoint can be kept for future integration with TTS services
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { text, voice } = req.body;
        
        // For now, return success and let the frontend handle TTS with Web Speech API
        return res.status(200).json({ 
            success: true,
            text: text,
            voice: voice,
            message: "Using browser-based TTS"
        });

    } catch (error) {
        console.error("TTS Error:", error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}