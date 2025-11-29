import React, { useState } from 'react';
import { Sparkles, Loader2, Music2 } from 'lucide-react';
import { generateSpark, SparkSuggestion } from '../services/geminiService';

const SparkAI: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SparkSuggestion | null>(null);

  const handleSpark = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    const suggestion = await generateSpark(prompt);
    setResult(suggestion);
    setLoading(false);
  };

  return (
    <div className="w-full bg-bv-surface border border-neutral-800 rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-bv-amber" size={20} />
            <h2 className="text-lg font-bold text-white">Creative Spark</h2>
        </div>

        {!result ? (
            <div className="flex flex-col gap-3">
                <textarea
                    className="w-full bg-black/40 border border-neutral-700 rounded-xl p-3 text-sm focus:outline-none focus:border-bv-indigo text-white placeholder:text-neutral-600 resize-none h-24"
                    placeholder="Describe a vibe (e.g., 'Cyberpunk chase scene', 'Lazy Sunday morning', 'Aggressive Phonk')..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
                <button
                    onClick={handleSpark}
                    disabled={loading || !prompt}
                    className="w-full py-3 bg-gradient-to-r from-bv-indigo to-pink-500 rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    Generate Idea
                </button>
            </div>
        ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-black/40 rounded-xl p-4 border border-neutral-800 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-bold text-bv-teal uppercase tracking-wider">Vibe Detected</span>
                            <h3 className="text-xl font-bold text-white">{result.vibe}</h3>
                        </div>
                        <div className="bg-neutral-800 px-2 py-1 rounded text-xs font-mono text-neutral-300">
                            {result.bpm} BPM
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-neutral-800/50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                                <Music2 size={12} /> Instrument
                            </div>
                            <p className="text-bv-indigo font-medium">{result.instrument}</p>
                        </div>
                        <div className="bg-neutral-800/50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                                <span className="text-lg leading-none">♪</span> Pattern
                            </div>
                            <p className="text-white text-sm line-clamp-2">{result.patternDescription}</p>
                        </div>
                    </div>

                    <div className="border-t border-neutral-800 pt-3">
                        <p className="text-xs text-neutral-500 uppercase font-bold mb-1">Spark Lyric / Chop</p>
                        <p className="text-lg font-serif italic text-bv-amber">"{result.lyrics}"</p>
                    </div>

                    <button 
                        onClick={() => { setResult(null); setPrompt(''); }}
                        className="w-full py-2 mt-2 text-xs font-bold text-neutral-500 hover:text-white transition-colors"
                    >
                        Start Over
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default SparkAI;
