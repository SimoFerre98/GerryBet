'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Bet {
  id: string
  amount_gp: number
  status: string
  created_at: string
  profiles: { username: string } | null
  odds: { description: string; value: number } | null
}

interface Props {
  bets: Bet[]
  matchLabel: string
}

export function BetsModal({ bets, matchLabel }: Props) {
  const [open, setOpen] = useState(false)

  const totalStaked = bets.reduce((s, b) => s + b.amount_gp, 0)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-400 uppercase tracking-wide bg-slate-900/50 hover:bg-indigo-500/10 border border-slate-700/50 hover:border-indigo-500/30 rounded-xl px-3 py-2 transition-all w-full justify-between"
      >
        <span>💸 Scommesse Piazzate ({bets.length})</span>
        {totalStaked > 0 && (
          <span className="text-indigo-400 font-mono">{totalStaked} GC in gioco</span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="fixed inset-0 z-[210] flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-2xl pointer-events-auto flex flex-col max-h-[80vh]"
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-6 border-b border-slate-700/50 flex items-start justify-between gap-4 flex-shrink-0">
                  <div>
                    <h2 className="text-xl font-black text-white">Scommesse Piazzate</h2>
                    <p className="text-slate-400 text-sm mt-1">{matchLabel}</p>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-slate-500 hover:text-white transition-colors text-2xl leading-none mt-1"
                  >
                    ✕
                  </button>
                </div>

                {/* Stats bar */}
                {bets.length > 0 && (
                  <div className="px-6 py-3 bg-slate-800/50 grid grid-cols-3 gap-4 text-center flex-shrink-0">
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide">Totale scommesse</div>
                      <div className="text-lg font-black text-white">{bets.length}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide">GC in gioco</div>
                      <div className="text-lg font-black text-yellow-400">{totalStaked} GC</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide">Max payout</div>
                      <div className="text-lg font-black text-green-400">
                        {Math.max(...bets.map(b => Math.floor(b.amount_gp * (b.odds?.value || 1))))} GC
                      </div>
                    </div>
                  </div>
                )}

                {/* Bets list */}
                <div className="overflow-y-auto flex-1 p-4 space-y-2">
                  {bets.length > 0 ? (
                    bets.map((bet) => {
                      const potentialWin = Math.floor(bet.amount_gp * (bet.odds?.value || 1))
                      return (
                        <div
                          key={bet.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-sm shrink-0">
                              {bet.profiles?.username?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div>
                              <div className="font-bold text-white text-sm">{bet.profiles?.username || 'Sconosciuto'}</div>
                              <div className="text-xs text-slate-500">{new Date(bet.created_at).toLocaleString('it-IT')}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-sm">
                            <div className="text-center">
                              <div className="text-[10px] text-slate-500 uppercase">Punta su</div>
                              <div className="font-black text-white text-lg">{bet.odds?.description || '?'}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-[10px] text-slate-500 uppercase">Quota</div>
                              <div className="font-mono font-bold text-slate-300">{bet.odds?.value}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-[10px] text-slate-500 uppercase">Importo</div>
                              <div className="font-bold text-white">{bet.amount_gp} GC</div>
                            </div>
                            <div className="text-center">
                              <div className="text-[10px] text-slate-500 uppercase">Vincita</div>
                              <div className="font-bold text-green-400">{potentialWin} GC</div>
                            </div>
                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg ${
                              bet.status === 'won' ? 'bg-green-500/20 text-green-400' :
                              bet.status === 'lost' ? 'bg-red-500/20 text-red-400' :
                              'bg-slate-700 text-slate-300'
                            }`}>
                              {bet.status === 'pending' ? 'In attesa' : bet.status === 'won' ? 'Vinta' : 'Persa'}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center text-slate-500 py-12">
                      <div className="text-4xl mb-3">🎯</div>
                      <div className="font-bold text-slate-400">Nessuna scommessa ancora</div>
                      <div className="text-sm mt-1">Gli utenti non hanno ancora puntato su questa partita.</div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
