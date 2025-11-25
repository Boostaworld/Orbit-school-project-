
import React, { useState } from 'react';
import { useOrbitStore } from '../../store/useOrbitStore';
import { Search, Loader2, Database, BrainCircuit, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IntelResults } from './IntelResults';
import { SaveDropModal } from './SaveDropModal';
import clsx from 'clsx';

export const IntelPanel: React.FC = () => {
  const [query, setQuery] = useState('');
  const [useDeepThinking, setUseDeepThinking] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');

  const { executeIntelQuery, isIntelLoading, currentIntelResult } = useOrbitStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isIntelLoading) return;

    setCurrentQuery(query);
    try {
      await executeIntelQuery(query, useDeepThinking);
    } catch (error) {
      console.error('Intel query failed:', error);
    }
  };

  const handleSave = () => {
    setShowSaveModal(true);
  };

  const handleCloseSaveModal = () => {
    setShowSaveModal(false);
    setQuery('');
    setCurrentQuery('');
    setUseDeepThinking(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-gradient-to-r from-slate-900/90 to-slate-900/60 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(124,58,237,0.05)_50%,transparent_100%)] animate-shimmer" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Database className="w-5 h-5 text-cyan-400" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <h2 className="font-bold text-slate-100 tracking-wider">INTEL ENGINE</h2>
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">AI Research Terminal</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-600">STATUS:</span>
            <span className="text-cyan-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              OPERATIONAL
            </span>
          </div>
        </div>
      </div>

      {/* Search Input Area */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/40 space-y-3">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 rounded-lg opacity-0 group-focus-within:opacity-100 blur transition-opacity" />
            <div className="relative flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden group-focus-within:border-cyan-500/50 transition-colors">
              <Search className="w-4 h-4 text-slate-500 ml-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter research query..."
                disabled={isIntelLoading}
                className="flex-1 bg-transparent px-2 py-3 text-sm text-slate-200 focus:outline-none placeholder:text-slate-600 font-mono"
              />
              <button
                type="submit"
                disabled={!query.trim() || isIntelLoading}
                className="px-4 py-3 bg-gradient-to-r from-cyan-600 to-violet-600 text-white font-mono text-xs uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:from-cyan-500 hover:to-violet-500 transition-all"
              >
                {isIntelLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    PROCESSING
                  </span>
                ) : (
                  'EXECUTE'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Deep Dive Toggle */}
        <div className="flex items-center justify-between">
           <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wide">
             Query structured intelligence from global sources
           </p>
           
           <button 
             type="button"
             onClick={() => setUseDeepThinking(!useDeepThinking)}
             disabled={isIntelLoading}
             className={clsx(
               "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-mono disabled:opacity-50",
               useDeepThinking 
                 ? "bg-violet-500/10 border-violet-500 text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                 : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
             )}
           >
             <div className="relative">
               <BrainCircuit className={clsx("w-3.5 h-3.5", useDeepThinking && "animate-pulse")} />
               {useDeepThinking && (
                 <motion.div 
                   layoutId="sparkles"
                   className="absolute -top-1 -right-1"
                 >
                   <Sparkles className="w-2 h-2 text-yellow-400" />
                 </motion.div>
               )}
             </div>
             <span>DEEP THINKING MODE</span>
             {useDeepThinking && <span className="px-1 bg-violet-600 text-white text-[9px] rounded ml-1">PRO</span>}
           </button>
        </div>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <AnimatePresence mode="wait">
          {isIntelLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full gap-6"
            >
              <div className="relative">
                <div className="w-20 h-20 border-4 border-slate-800 rounded-full" />
                <div className={clsx(
                  "absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-spin",
                  useDeepThinking ? "border-t-violet-500 border-r-fuchsia-500 duration-[2s]" : "border-t-cyan-500 border-r-violet-500"
                )} />
                {useDeepThinking && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BrainCircuit className="w-8 h-8 text-violet-500 animate-pulse" />
                  </div>
                )}
              </div>
              <div className="text-center max-w-xs">
                <p className={clsx(
                  "font-mono text-sm uppercase tracking-widest mb-2",
                  useDeepThinking ? "text-violet-400" : "text-slate-400"
                )}>
                  {useDeepThinking ? "Deep Neural Analysis" : "Analyzing Query"}
                </p>
                {useDeepThinking ? (
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Accessing extended context window (32k). Cross-referencing hundreds of vectors. This may take a moment.
                  </p>
                ) : (
                  <div className="flex gap-1 justify-center mt-2">
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {!isIntelLoading && currentIntelResult && (
            <IntelResults
              result={currentIntelResult}
              query={currentQuery}
              onSave={handleSave}
            />
          )}

          {!isIntelLoading && !currentIntelResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center gap-4"
            >
              <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700">
                <Database className="w-10 h-10 text-slate-600" />
              </div>
              <div>
                <p className="text-slate-400 font-mono text-sm uppercase tracking-widest mb-1">No Active Query</p>
                <p className="text-slate-600 text-xs max-w-xs">
                  Execute a research query to generate structured intelligence dossiers
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Save Modal */}
      <AnimatePresence>
        {showSaveModal && currentIntelResult && (
          <SaveDropModal
            query={currentQuery}
            onClose={handleCloseSaveModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
