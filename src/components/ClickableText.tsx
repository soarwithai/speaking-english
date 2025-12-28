import React, { useState } from 'react';
import { translateWord } from '../services/gemini';

interface ClickableTextProps {
  text: string;
  context: string;
  className?: string;
}

const ClickableText: React.FC<ClickableTextProps> = ({ text, context, className }) => {
  const [popover, setPopover] = useState<{ word: string, translation: string | null, x: number, y: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleWordClick = async (e: React.MouseEvent<HTMLSpanElement>, word: string) => {
    // Remove punctuation from the word for translation lookup
    const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, "");
    if (!cleanWord) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setPopover({
      word: cleanWord,
      translation: null,
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY - 10
    });
    setLoading(true);

    try {
      const translation = await translateWord(cleanWord, context);
      setPopover(prev => prev ? { ...prev, translation } : null);
    } catch (err) {
      setPopover(prev => prev ? { ...prev, translation: "Error" } : null);
    } finally {
      setLoading(false);
    }
  };

  const closePopover = () => setPopover(null);

  // Split text into words but keep whitespace/punctuation for rendering
  // A simple way is to split by spaces and render. 
  // For better granularity, we just split by space and let the user click the chunk.
  const words = text.split(/(\s+)/);

  return (
    <div className={`relative ${className}`}>
      <p className="leading-relaxed">
        {words.map((segment, i) => {
          // If segment is just whitespace, render it
          if (/^\s+$/.test(segment)) return <span key={i}>{segment}</span>;
          
          return (
            <span
              key={i}
              onClick={(e) => handleWordClick(e, segment)}
              className="cursor-pointer hover:bg-yellow-200 hover:text-yellow-900 rounded px-0.5 transition-colors duration-150 active:bg-yellow-300"
            >
              {segment}
            </span>
          );
        })}
      </p>

      {popover && (
        <>
          <div className="fixed inset-0 z-40 bg-transparent" onClick={closePopover} />
          <div 
            className="absolute z-50 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl -translate-y-full -translate-x-1/2"
            style={{ 
                // Using fixed positioning relative to viewport often safer for tooltips, 
                // but absolute relative to container works if container is relative.
                // Here let's just use the logic to place it near the word.
                // Since parent is relative, we can just position it.
                // However, the coordinates calculated are page coordinates. 
                // Let's use fixed position for the tooltip to be safe.
                position: 'fixed',
                left: popover.x + 20, // slightly offset center
                top: popover.y - 10
            }}
          >
            <div className="font-semibold mb-1 border-b border-gray-700 pb-1">{popover.word}</div>
            <div className="whitespace-nowrap">
                {loading ? (
                    <span className="flex items-center gap-2">
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Translating...
                    </span>
                ) : (
                    popover.translation
                )}
            </div>
            {/* Arrow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-4 border-transparent border-t-gray-900"></div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClickableText;