import React, { useState, useEffect } from 'react';
import { PlayIcon } from './Icons';
import { speakText } from '../services/gemini';
import { VoiceName } from '../types';

interface AudioPlayerProps {
  text: string;
  voice?: VoiceName;
  label?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ text, voice = 'Puck', label }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext on mount (or first user interaction technically required, handled in play)
    return () => {
        if (audioContext) {
            audioContext.close();
        }
    };
  }, [audioContext]);

  const handlePlay = async () => {
    if (isLoading || isPlaying) return;
    setIsLoading(true);

    try {
      const base64Audio = await speakText(text, voice);
      
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      setAudioContext(ctx);

      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Decode audio
      // Note: pure decodeAudioData works for many formats, but Gemini sends raw PCM often unless specified.
      // However, the Gemini 2.5 TTS endpoint usually sends a wav/pcm format that verify via context decode.
      // If raw PCM is needed, we would manually buffer it. 
      // The instructions say "The audio bytes returned by the API is raw PCM data."
      // So we must manually build the buffer.

      const dataInt16 = new Int16Array(bytes.buffer);
      const numChannels = 1;
      const sampleRate = 24000;
      const frameCount = dataInt16.length / numChannels;
      
      const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < frameCount; i++) {
          channelData[i] = dataInt16[i] / 32768.0;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      
      source.onended = () => {
        setIsPlaying(false);
        // ctx.close(); // Optional: Keep context alive if replaying frequently
      };

      source.start();
      setIsPlaying(true);
    } catch (err) {
      console.error("Audio playback error", err);
      alert("Could not play audio.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePlay}
      disabled={isLoading || isPlaying}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        isLoading ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
      }`}
    >
      <PlayIcon className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
      {label || (isLoading ? 'Loading...' : 'Play')}
    </button>
  );
};

export default AudioPlayer;