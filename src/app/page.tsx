// src/app/page.tsx

'use client';

import React, { useState, useMemo } from 'react';
import { useDictionary } from '@/hooks/useDictionary';
import { universalSolver } from '@/lib/solver';


export default function SolverPage() {
  const { words, loading } = useDictionary();
  // UI State
  const [pattern, setPattern] = useState('.....'); // Default to 5 dots for Wordle
  const [mustContain, setMustContain] = useState('');
  const [mustExclude, setMustExclude] = useState('');
  const [resultsToShow, setResultsToShow] = useState(100);

  // Run solver automatically whenever inputs change
  // useMemo prevents re-running if nothing changed
  const results = useMemo(() => {
    if (loading || words.length === 0) return [];
    return universalSolver({
      dictionary: words,
      pattern: pattern,
      mustContain: mustContain,
      mustExclude: mustExclude
    });
  }, [words, loading, pattern, mustContain, mustExclude]);

  // Reset resultsToShow when results change
  React.useEffect(() => {
    setResultsToShow(100);
  }, [results]);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-6 flex flex-col items-center">
      <div className="max-w-xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-emerald-400">Word Solver</h1>
          <p className="text-slate-400 text-sm">
            {loading ? "Loading Dictionary..." : `Loaded ${words.length.toLocaleString()} words`}
          </p>
        </div>
        {/* Inputs Panel */}
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 space-y-6">
          {/* Pattern Input with Dot Counter */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-300">
                Pattern <span className="text-slate-500">(Use . for unknown)</span>
              </label>
              <span className="text-xs text-slate-400 bg-slate-700 rounded px-2 py-0.5 ml-2" title="Number of dots in pattern">
                Dots: {pattern.split('').filter(c => c === '.').length}
              </span>
            </div>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="w-full text-2xl font-mono tracking-widest text-center bg-slate-900 border border-slate-600 rounded-lg py-3 focus:ring-2 focus:ring-emerald-500 outline-none uppercase"
              placeholder="S..RE"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Must Contain (Yellow) */}
            <div>
              <label className="block text-xs uppercase font-bold text-yellow-500 mb-1">
                Contains (Yellow)
              </label>
              <input
                type="text"
                value={mustContain}
                onChange={(e) => setMustContain(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 px-3 focus:border-yellow-500 outline-none uppercase"
                placeholder="EA"
              />
            </div>
            {/* Must Exclude (Gray) */}
            <div>
              <label className="block text-xs uppercase font-bold text-red-500 mb-1">
                Excludes (Gray)
              </label>
              <input
                type="text"
                value={mustExclude}
                onChange={(e) => setMustExclude(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 px-3 focus:border-red-500 outline-none uppercase"
                placeholder="XYZ"
              />
            </div>
          </div>
        </div>
        {/* Results Area */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-400">
            Possible Matches ({results.length})
          </h2>
          <p className="text-xs text-slate-500 mb-2 text-center">Click a word to copy it to your clipboard.</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {results.slice(0, resultsToShow).map((word) => (
              <div
                key={word}
                className="bg-slate-800 text-center py-2 rounded border border-slate-700 hover:bg-slate-700 hover:border-emerald-500 transition-colors cursor-pointer text-sm font-medium"
                onClick={() => navigator.clipboard.writeText(word)}
                title="Click to copy"
              >
                {word}
              </div>
            ))}
          </div>
          {results.length > resultsToShow && (
            <div className="flex flex-col items-center mt-4 space-y-2">
              <button
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors text-sm font-semibold"
                onClick={() => setResultsToShow(r => r + 100)}
              >
                Load More
              </button>
              <button
                className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-800 transition-colors text-sm font-semibold"
                onClick={() => setResultsToShow(results.length)}
              >
                Load All
              </button>
              <p className="text-center text-xs text-slate-500 mt-2">
                Showing {resultsToShow} of {results.length} results.
              </p>
            </div>
          )}
          {results.length === 0 && !loading && (
             <div className="text-center py-8 text-slate-500 italic">
               No words found matching criteria.
             </div>
          )}
        </div>
      </div>
    </main>
  );
}