import { FreeTalkResponse, ScenarioEvaluation, ScenarioSetup, VoiceName, ScenarioDifficulty } from "../types";

// API Base URL
const API_BASE = '/api';

/**
 * Unified fetch wrapper for text generation tasks
 */
async function postChatTask<T>(task: string, payload: any): Promise<T> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, ...payload }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to complete task: ${task}`);
  }

  const data = await response.json();
  return data as T;
}

export const generateFreeTalkVariations = async (input: string): Promise<FreeTalkResponse> => {
  return postChatTask<FreeTalkResponse>('free-talk', { input });
};

export const generateScenario = async (topic: string, difficulty: ScenarioDifficulty): Promise<ScenarioSetup> => {
  return postChatTask<ScenarioSetup>('scenario', { topic, difficulty });
};

export const evaluateUserResponse = async (scenario: ScenarioSetup, userSpeech: string): Promise<ScenarioEvaluation> => {
  return postChatTask<ScenarioEvaluation>('evaluate', { scenario, userSpeech });
};

export const translateWord = async (word: string, context: string): Promise<string> => {
  const data = await postChatTask<{ translation: string }>('translate', { word, context });
  return data.translation;
};

export const speakText = async (text: string, voice: VoiceName = 'Puck'): Promise<string> => {
  const response = await fetch(`${API_BASE}/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'TTS failed');
  }

  const data = await response.json();
  return data.audio;
};