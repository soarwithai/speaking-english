import React, { useState, useEffect, useRef } from 'react';
import { generateScenario, evaluateUserResponse, speakText } from '../services/gemini';
import { ScenarioSetup, ScenarioEvaluation, SCENARIO_TOPICS, ScenarioDifficulty } from '../types';
import { MicIcon, RefreshIcon, SendIcon } from './Icons';
import AudioPlayer from './AudioPlayer';
import ClickableText from './ClickableText';

const ScenarioPractice: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [scenario, setScenario] = useState<ScenarioSetup | null>(null);
  const [userResponse, setUserResponse] = useState('');
  const [evaluation, setEvaluation] = useState<ScenarioEvaluation | null>(null);
  const [difficulty, setDifficulty] = useState<ScenarioDifficulty>(ScenarioDifficulty.BEGINNER);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      // Continuous true so it doesn't stop on pause
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-GB';

      recognitionRef.current.onresult = (event: any) => {
        // Collect all results
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setUserResponse(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
      };
      
      // We handle stop manually, but if it stops for other reasons:
      recognitionRef.current.onend = () => {
          setIsListening(false);
      };
    }
  }, []);

  const handleNewScenario = async () => {
    setLoading(true);
    setScenario(null);
    setEvaluation(null);
    setUserResponse('');
    
    const randomTopic = SCENARIO_TOPICS[Math.floor(Math.random() * SCENARIO_TOPICS.length)];
    
    try {
      const data = await generateScenario(randomTopic, difficulty);
      setScenario(data);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to generate scenario.");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!scenario || !userResponse.trim()) return;
    setLoading(true);
    try {
      const data = await evaluateUserResponse(scenario, userResponse);
      setEvaluation(data);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to evaluate response.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      // setIsListening will be set to false in onend
    } else {
      // Clear previous if starting new
      // Note: If we want to append, we'd need to manage state differently vs the transcript logic in onresult.
      // Currently onresult rebuilds from the session. Let's restart the session.
      // If the user wants to append, standard behavior with continuous=true usually replaces the buffer or appends?
      // Actually, creating a new session usually clears unless we manually append to previous string.
      // For simplicity, let's allow editing text manually if they want to combine multiple recordings,
      // but for this implementation, starting mic will act on the current input field.
      // Since `onresult` overwrites `userResponse` based on `event.results` of the *current* session,
      // it's safer to not clear userResponse but we need to handle the append logic if we want to support multiple mic sessions.
      // However, SpeechRecognition implementation often resets `results` on new `start()`.
      // Let's keep it simple: It overwrites for the current session.
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">UK Math Student Simulator</h2>
        
        <div className="flex items-center p-1 bg-gray-100 rounded-lg">
          {Object.values(ScenarioDifficulty).map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                difficulty === level
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        <button
          onClick={handleNewScenario}
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 shadow-lg transition-transform active:scale-95"
        >
          <RefreshIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          {scenario ? 'Change Scenario' : 'Generate New Scenario'}
        </button>
      </div>

      {scenario && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
            <div className="flex justify-between items-center">
                <div>
                    <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Current Scenario</div>
                    <h3 className="text-xl font-bold text-indigo-900">{scenario.topic}</h3>
                </div>
                <div className="bg-white px-3 py-1 rounded-full text-xs font-bold text-indigo-600 border border-indigo-100 uppercase">
                    {difficulty}
                </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="prose prose-indigo text-gray-600">
               <div className="flex items-start gap-2">
                 <div className="flex-1">
                    <ClickableText 
                        text={scenario.description} 
                        context={scenario.topic} 
                        className="text-gray-700"
                    />
                 </div>
               </div>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
              <span className="font-bold text-amber-800 block mb-1">Prompt / Question:</span>
              <div className="text-lg text-amber-900 mb-2">
                <ClickableText text={scenario.question} context={scenario.description} />
              </div>
              <div className="mt-2">
                 <AudioPlayer text={scenario.question} voice="Puck" label="Listen to Prompt" />
              </div>
            </div>
            
            <div className="text-xs text-gray-400 italic text-center">
                Tip: Click on any word in the scenario or prompt to see its Chinese translation.
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Your Response (Type or Speak):</label>
              <div className="relative">
                <textarea
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  className="w-full p-4 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px]"
                  placeholder="How would you respond in this situation?"
                />
                <button
                  onClick={toggleMic}
                  className={`absolute bottom-4 right-4 p-2 rounded-full transition-colors flex items-center gap-2 ${
                    isListening ? 'bg-red-500 text-white animate-pulse shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <MicIcon className="w-5 h-5" />
                  {isListening && <span className="text-xs font-bold px-1">STOP</span>}
                </button>
              </div>
              <button
                onClick={handleEvaluate}
                disabled={loading || !userResponse}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                 {loading ? 'Analyzing...' : <> <SendIcon className="w-4 h-4" /> Evaluate My Response </>}
              </button>
            </div>
          </div>
        </div>
      )}

      {evaluation && (
        <div className="space-y-6 animate-fade-in-up">
           {/* Score & Critique */}
           <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm md:col-span-1 flex flex-col items-center justify-center">
                 <div className="text-4xl font-black text-indigo-600">{evaluation.score}/10</div>
                 <div className="text-sm text-gray-500 uppercase tracking-wide mt-2">Relevance Score</div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm md:col-span-2">
                 <h4 className="font-bold text-gray-800 mb-2">Critique</h4>
                 <p className="text-gray-600">{evaluation.critique}</p>
              </div>
           </div>

           {/* Better Example */}
           <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-xl border border-teal-100 shadow-sm">
              <h4 className="font-bold text-teal-800 mb-3 flex items-center gap-2">
                Recommended Native Expression
              </h4>
              <p className="text-lg text-teal-900 italic mb-4">"{evaluation.betterExample}"</p>
              <AudioPlayer text={evaluation.betterExample} voice="Charon" />
           </div>

           {/* Cultural Note */}
           <div className="bg-white p-6 rounded-xl border-l-4 border-rose-400 shadow-sm">
              <h4 className="font-bold text-rose-800 mb-2 flex items-center gap-2">
                🇬🇧 UK Cultural Insight
              </h4>
              <p className="text-gray-700 leading-relaxed">{evaluation.culturalNote}</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioPractice;