'use client'

import { updateSystemSetting } from '@/app/actions/admin_entities'
import { ActionForm } from './ActionForm'
import { useState } from 'react'

type Setting = {
  key: string
  value: number
  description: string
}

export default function SystemSettingsClient({ settings }: { settings: Setting[] }) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  const maxBet = settings.find(s => s.key === 'max_bet')?.value || 500
  const maxWin = settings.find(s => s.key === 'max_win')?.value || 5000

  return (
    <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700 shadow-xl mb-10">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>⚙️</span> Impostazioni Globali (Limiti)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Puntata Massima */}
        <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700/50 relative">
          <ActionForm actionFunc={updateSystemSetting} successMessage="Puntata Massima aggiornata!">
            <input type="hidden" name="key" value="max_bet" />
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                Puntata Massima
                <button 
                  type="button" 
                  className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold hover:bg-indigo-500 hover:text-white transition-colors"
                  onMouseEnter={() => setActiveTooltip('max_bet')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={() => setActiveTooltip(activeTooltip === 'max_bet' ? null : 'max_bet')}
                >
                  i
                </button>
              </label>
            </div>
            
            {activeTooltip === 'max_bet' && (
              <div className="absolute z-10 -top-2 left-0 w-full transform -translate-y-full bg-indigo-900 text-indigo-100 p-3 rounded-xl shadow-xl text-xs border border-indigo-700/50">
                Il numero massimo di GerryCoin che un utente può puntare su una singola scommessa. Limita l'esposizione del banco su giocate massicce.
              </div>
            )}

            <div className="flex gap-2">
              <input 
                name="value" 
                type="number" 
                defaultValue={maxBet} 
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white font-bold focus:border-indigo-500 outline-none transition-all" 
                required 
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-lg transition-all shadow-lg text-sm">
                Salva
              </button>
            </div>
          </ActionForm>
        </div>

        {/* Vincita Massima */}
        <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700/50 relative">
          <ActionForm actionFunc={updateSystemSetting} successMessage="Vincita Massima aggiornata!">
            <input type="hidden" name="key" value="max_win" />
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                Vincita Massima
                <button 
                  type="button" 
                  className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold hover:bg-amber-500 hover:text-white transition-colors"
                  onMouseEnter={() => setActiveTooltip('max_win')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={() => setActiveTooltip(activeTooltip === 'max_win' ? null : 'max_win')}
                >
                  i
                </button>
              </label>
            </div>

            {activeTooltip === 'max_win' && (
              <div className="absolute z-10 -top-2 left-0 w-full transform -translate-y-full bg-amber-900 text-amber-100 p-3 rounded-xl shadow-xl text-xs border border-amber-700/50">
                Il tetto massimo di GerryCoin che il sistema pagherà per una singola giocata vincente, indipendentemente da quanto sia alta la quota. Serve a proteggerti dal "Cigno Nero" (es. schedina assurda).
              </div>
            )}

            <div className="flex gap-2">
              <input 
                name="value" 
                type="number" 
                defaultValue={maxWin} 
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white font-bold focus:border-amber-500 outline-none transition-all" 
                required 
              />
              <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-lg transition-all shadow-lg text-sm">
                Salva
              </button>
            </div>
          </ActionForm>
        </div>

      </div>
    </div>
  )
}
