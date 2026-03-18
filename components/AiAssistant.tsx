import React, { useState } from 'react';
import { analyzeDomainQuery } from '../services/geminiService';
import { Bot, Send, Loader2 } from 'lucide-react';

export const AiAssistant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse(''); // Clear previous
    const result = await analyzeDomainQuery(query);
    setResponse(result);
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-4xl mx-auto my-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                 <Bot size={24} />
            </div>
            <div>
                <h2 className="text-lg font-bold">Domain Architect AI</h2>
                <p className="text-indigo-100 text-sm">Ask questions about the University Domain Model</p>
            </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto min-h-[400px] bg-slate-50">
        {response ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-fade-in">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Analysis Result</h3>
            <div className="prose prose-indigo prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
                {response}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
             <Bot size={48} className="mb-4 text-slate-300" />
             <p>Ask about entities like "Student", "Dean", or relationships.</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleAnalyze} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Explain the relationship between Dean and FacultyGroup"
            className="flex-1 bg-slate-100 border-0 rounded-lg px-4 focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            Analyze
          </button>
        </form>
      </div>
    </div>
  );
};