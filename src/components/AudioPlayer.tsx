import React, { useState } from 'react';
import { PlayIcon } from './Icons';
import { VoiceName } from '../types';

interface AudioPlayerProps {
  text: string;
  voice?: VoiceName;
  label?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ text, voice = 'Puck', label }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    if (isPlaying || !text) return;

    // Use browser's Web Speech API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to use a British English voice
      const voices = window.speechSynthesis.getVoices();
      const britishVoice = voices.find(v => v.lang.startsWith('en-GB')) || voices.find(v => v.lang.startsWith('en'));
      
      if (britishVoice) {
        utterance.voice = britishVoice;
      }
      
      utterance.lang = 'en-GB';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        setIsPlaying(false);
        console.error("Speech synthesis error");
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in your browser.");
    }
  };

  return (
    <button 
      onClick={handlePlay}
      disabled={isPlaying}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        isPlaying ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
      }`}
    >
      <PlayIcon className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
      {label || (isPlaying ? 'Playing...' : 'Play')}
    </button>
  );
};

export default AudioPlayer;