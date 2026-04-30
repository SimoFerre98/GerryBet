'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

type Match = {
  id: string;
  start_time: string;
  status: string;
  result: string | null;
  team_a: { name: string };
  team_b: { name: string };
};

export default function MatchListClient({ initialMatches }: { initialMatches: Match[] }) {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'finished'>('all');
  const [search, setSearch] = useState('');

  const filteredMatches = useMemo(() => {
    return initialMatches.filter((match) => {
      const matchDate = new Date(match.start_time);
      const isPast = matchDate <= new Date() || match.status === 'closed';
      
      // Filter by status
      if (filter === 'upcoming' && (isPast && match.status !== 'open')) return false;
      if (filter === 'finished' && match.status === 'open' && !isPast) return false;

      // Filter by search
      const searchLower = search.toLowerCase();
      if (search && !match.team_a.name.toLowerCase().includes(searchLower) && !match.team_b.name.toLowerCase().includes(searchLower)) {
        return false;
      }

      return true;
    });
  }, [initialMatches, filter, search]);

  const stats = useMemo(() => {
    const upcoming = initialMatches.filter(m => m.status === 'open' && new Date(m.start_time) > new Date()).length;
    const finished = initialMatches.filter(m => m.status === 'closed' || new Date(m.start_time) <= new Date()).length;
    return { upcoming, finished };
  }, [initialMatches]);

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch md:items-center justify-between bg-slate-900/50 backdrop-blur-xl p-4 md:p-6 rounded-3xl md:rounded-[2rem] border border-white/5 shadow-xl">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Cerca squadra..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-12 py-3 md:py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-50">🔍</span>
        </div>

        <div className="flex bg-slate-950/50 p-1 rounded-2xl border border-white/5 shadow-inner overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap ${
              filter === 'all' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tutte
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              filter === 'upcoming' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Prossime
            <span className="bg-white/10 px-1.5 py-0.5 rounded text-[9px] md:text-[10px]">{stats.upcoming}</span>
          </button>
          <button
            onClick={() => setFilter('finished')}
            className={`flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              filter === 'finished' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Concluse
            <span className="bg-white/10 px-1.5 py-0.5 rounded text-[9px] md:text-[10px]">{stats.finished}</span>
          </button>
        </div>
      </div>

      {/* Matches List */}
      <div className="grid gap-4 md:gap-6">
        <AnimatePresence mode="popLayout">
          {filteredMatches.length > 0 ? (
            filteredMatches.map((match) => {
              const hasStarted = new Date(match.start_time) <= new Date();
              const isClosed = match.status === 'closed';
              
              return (
                <motion.div
                  layout
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link 
                    href={hasStarted ? '#' : `/matches/${match.id}`}
                    className={`relative overflow-hidden bg-slate-900/30 backdrop-blur-2xl rounded-[2rem] p-5 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-5 md:gap-6 block group ${hasStarted ? 'opacity-70' : 'hover:bg-slate-800/40 hover:border-indigo-400/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1'}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="flex-1 w-full text-center md:text-left relative z-10">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 mb-4 md:mb-3">
                        <p className="text-[10px] md:text-xs text-indigo-300 font-bold uppercase tracking-widest drop-shadow-md bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">
                          {new Date(match.start_time).toLocaleString('it-IT', { 
                            weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                          })}
                        </p>
                        {isClosed && (
                          <span className="text-[9px] md:text-[10px] bg-slate-700/50 text-slate-300 border border-white/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Terminata</span>
                        )}
                        {!isClosed && hasStarted && (
                          <span className="text-[9px] md:text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter animate-pulse">In Corso</span>
                        )}
                      </div>
                      
                      <div className="text-xl md:text-3xl font-black text-white flex justify-between md:justify-start items-center gap-2 md:gap-6 w-full drop-shadow-md">
                        <span className="flex-1 md:flex-initial text-right md:text-left truncate max-w-[40%] md:max-w-none">{match.team_a.name}</span>
                        
                        {isClosed ? (
                          <div className="flex items-center gap-1.5 md:gap-3 bg-slate-950/80 px-3 md:px-5 py-1.5 md:py-2.5 rounded-xl md:rounded-2xl border border-white/10 shadow-inner shrink-0">
                            <span className="text-xl md:text-3xl font-black text-indigo-400">{match.result?.split('-')[0] || '0'}</span>
                            <span className="text-slate-600 text-lg md:text-xl">-</span>
                            <span className="text-xl md:text-3xl font-black text-indigo-400">{match.result?.split('-')[1] || '0'}</span>
                          </div>
                        ) : (
                          <div className="shrink-0 flex items-center justify-center w-10 md:w-14">
                            <span className="text-indigo-400 text-sm md:text-xl font-black bg-indigo-950/50 w-full py-1 md:py-2 rounded-lg border border-indigo-500/30 shadow-inner flex items-center justify-center italic">VS</span>
                          </div>
                        )}
                        
                        <span className="flex-1 md:flex-initial text-left truncate max-w-[40%] md:max-w-none">{match.team_b.name}</span>
                      </div>
                    </div>

                    <div className={`w-full md:w-auto relative z-10 px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold uppercase tracking-wide text-xs md:text-sm text-center whitespace-nowrap transition-all duration-300 border border-white/20 ${hasStarted ? 'bg-slate-800/50 text-slate-400 shadow-none border-white/5' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white group-hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]'}`}>
                      {isClosed ? 'Risultato Finale' : hasStarted ? 'Match Iniziato' : 'Scommetti Ora'}
                    </div>
                  </Link>
                </motion.div>
              );
            })
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-slate-900/30 backdrop-blur-2xl rounded-[3rem] border border-white/10 shadow-2xl"
            >
              <span className="text-6xl mb-6 block">🏟️</span>
              <h3 className="text-2xl font-bold text-white">Nessuna partita trovata</h3>
              <p className="text-slate-400 mt-2">Prova a cambiare i filtri o la ricerca.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
