import React, { useState } from 'react';
import { AppMode } from './types';
import FreeTalk from './components/FreeTalk';
import ScenarioPractice from './components/ScenarioPractice';
import { ChatIcon, CapIcon, SendIcon } from './components/Icons'; // Assuming LockIcon isn't in there, using generic or adding one.
import { Lock } from 'lucide-react';

const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'naonao') {
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center space-y-6">
         <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-indigo-600">
             <Lock className="w-8 h-8" />
         </div>
         <div>
            <h1 className="text-2xl font-bold text-gray-900">LingoMath UK</h1>
            <p className="text-gray-500 mt-2">Private Access Only</p>
         </div>
         
         <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(false); }}
                  placeholder="Enter Access Code"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-center text-lg tracking-widest"
                />
             </div>
             {error && <p className="text-red-500 text-sm">Incorrect password</p>}
             <button 
               type="submit"
               className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
             >
                Unlock
             </button>
         </form>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.FREE_TALK);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-lg">
               <CapIcon className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              Lingo<span className="text-indigo-600">Math</span> UK
            </h1>
          </div>
          <nav className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setMode(AppMode.FREE_TALK)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                mode === AppMode.FREE_TALK
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ChatIcon className="w-4 h-4" />
              Free Talk
            </button>
            <button
              onClick={() => setMode(AppMode.SCENARIO_PRACTICE)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                mode === AppMode.SCENARIO_PRACTICE
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CapIcon className="w-4 h-4" />
              Scenario Coach
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {mode === AppMode.FREE_TALK ? (
          <section className="animate-fade-in">
             <FreeTalk />
          </section>
        ) : (
          <section className="animate-fade-in">
            <ScenarioPractice />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} LingoMath UK. Powered by Google Gemini 2.0 Flash.</p>
          <p className="mt-1">Designed for Mathematics Students in the UK.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;