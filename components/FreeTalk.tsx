import React, { useState } from 'react';
import { generateFreeTalkVariations } from '../services/gemini';
import { FreeTalkResponse } from '../types';
import AudioPlayer from './AudioPlayer';
import { SendIcon } from './Icons';

const FreeTalk: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FreeTalkResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    try {
      const data = await generateFreeTalkVariations(input);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Failed to generate translations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">Free Talk Express</h2>
        <p className="text-gray-600">Enter a Chinese sentence or context to see three English variations.</p>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="例如：我想去买点水果，但是没带现金。"
          className="w-full p-4 pr-12 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-32 text-lg"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="absolute bottom-4 right-4 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <SendIcon className="w-5 h-5" />}
        </button>
      </form>

      {result && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Simple */}
          <div className="bg-white p-6 rounded-xl border border-green-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-xs font-semibold uppercase tracking-wide text-green-600 mb-2">Simple / Common</div>
            <p className="text-lg text-gray-800 mb-4">{result.simple}</p>
            <AudioPlayer text={result.simple} voice="Puck" />
          </div>

          {/* Formal */}
          <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-2">Formal / Academic</div>
            <p className="text-lg text-gray-800 mb-4">{result.formal}</p>
            <AudioPlayer text={result.formal} voice="Fenrir" />
          </div>

          {/* Slang */}
          <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-xs font-semibold uppercase tracking-wide text-purple-600 mb-2">British Slang</div>
            <p className="text-lg text-gray-800 mb-4">{result.slang}</p>
            <AudioPlayer text={result.slang} voice="Kore" />
          </div>
        </div>
      )}
    </div>
  );
};

export default FreeTalk;