<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# LingoMath UK - UK English Coach

A web application to help Chinese Mathematics students learn British English expressions and cultural nuances.

## Features

- **Free Talk Express**: Translate Chinese sentences into three English variations (Simple, Formal, British Slang)
- **Scenario Practice**: Practice real-life UK scenarios with AI feedback
- **Audio Playback**: Listen to pronunciations using browser's text-to-speech
- **Password Protection**: Private access only (password: `naonao`)

## Tech Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Vercel Serverless Functions
- **AI**: Google Gemini 2.0 Flash API

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` environment variable:
   Create a `.env` file in the root directory:
   ```
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

3. Run the app:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

4. Build for production:
   ```bash
   npm run build
   ```

## Deployment to Vercel

1. Push your code to GitHub
2. Import the project in Vercel dashboard
3. Add environment variable `GEMINI_API_KEY` in Vercel project settings
4. Deploy!

### Vercel Configuration

The project is configured with `vercel.json` for proper routing:
- Frontend static files served from `/dist`
- API routes available at `/api/chat` and `/api/tts`

## Project Structure

```
├── api/                  # Serverless API functions
│   ├── chat.js          # Main chat/translation API
│   └── tts.js           # Text-to-speech API (using browser API)
├── components/          # React components
│   ├── AudioPlayer.tsx  # Audio playback component
│   ├── FreeTalk.tsx     # Free talk mode
│   ├── ScenarioPractice.tsx
│   ├── ClickableText.tsx
│   └── Icons.tsx
├── services/            # API service layer
│   └── gemini.ts        # Gemini API wrapper
├── App.tsx              # Main app component
├── index.tsx            # App entry point
├── types.ts             # TypeScript types
└── vercel.json          # Vercel deployment config
```

## Recent Fixes (2025-12-28)

Fixed blank page issues on Vercel:

1. ✅ Added proper `package.json` with all dependencies
2. ✅ Fixed Google Generative AI package imports (`@google/generative-ai` instead of `@google/genai`)
3. ✅ Updated API syntax to match official Google SDK
4. ✅ Simplified TTS to use browser's Web Speech API
5. ✅ Added Vite configuration for proper bundling
6. ✅ Updated `vercel.json` for correct static build deployment
7. ✅ Fixed import references and removed invalid importmap from HTML
8. ✅ Added `lucide-react` dependency for icons
9. ✅ Build verified and tested locally

## API Endpoints

### POST /api/chat
Main text generation endpoint supporting multiple tasks:
- `free-talk`: Generate translation variations
- `scenario`: Generate practice scenarios
- `evaluate`: Evaluate user responses
- `translate`: Translate individual words

### POST /api/tts
Text-to-speech endpoint (currently returns success, actual TTS handled by browser)

View your app in AI Studio: https://ai.studio/apps/drive/1Gox_mgpkIG8U-yMup-KDq4O9wV35-k2m

## License

Private project for personal use.

## Credits

Powered by Google Gemini 2.0 Flash API
