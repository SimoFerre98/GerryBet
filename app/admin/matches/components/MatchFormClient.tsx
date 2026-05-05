'use client'

import { useState, useEffect, forwardRef } from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { createMatch } from '@/app/actions/admin_entities'
import { ActionForm } from '@/app/admin/components/ActionForm'

type Team = {
  id: string
  name: string
  power_ranking: number
}

export default function MatchFormClient({ teams }: { teams: Team[] }) {
  const [odd1, setOdd1] = useState('')
  const [oddX, setOddX] = useState('')
  const [odd2, setOdd2] = useState('')
  const [overround, setOverround] = useState<number | null>(null)
  const [startDate, setStartDate] = useState<Date | null>(null)

  // Custom Input per il DatePicker per mantenere lo stile
  const CustomDateInput = forwardRef<HTMLButtonElement, any>(({ value, onClick, className }, ref) => (
    <button type="button" className={className} onClick={onClick} ref={ref}>
      {value || "Seleziona data e ora"}
    </button>
  ))
  CustomDateInput.displayName = "CustomDateInput"

  useEffect(() => {
    const q1 = parseFloat(odd1)
    const qx = parseFloat(oddX)
    const q2 = parseFloat(odd2)

    if (!isNaN(q1) && !isNaN(qx) && !isNaN(q2) && q1 > 0 && qx > 0 && q2 > 0) {
      const sum = (1 / q1) + (1 / qx) + (1 / q2)
      setOverround(sum * 100)
    } else {
      setOverround(null)
    }
  }, [odd1, oddX, odd2])

  const suggestOdds = (baseOdd1: string) => {
    const q1 = parseFloat(baseOdd1)
    if (isNaN(q1) || q1 <= 1) return

    // Puntiamo a una lavagna (overround) del 110% per sicurezza
    const targetOverround = 1.10
    const p1 = 1 / q1
    const pRem = targetOverround - p1

    if (pRem <= 0) {
      // Quota 1 troppo bassa per sostenere altre quote con margine
      return
    }

    // Distribuzione tipica: il pareggio è circa il 28-30% della probabilità totale
    // Ma scaliamo proporzionalmente alla probabilità rimanente
    const pX = pRem * 0.55
    const p2 = pRem * 0.45

    setOddX((1 / pX).toFixed(2))
    setOdd2((1 / p2).toFixed(2))
  }

  const getOverroundColor = () => {
    if (overround === null) return 'text-slate-500'
    if (overround > 107) return 'text-green-400' // Sicuro (margine > 7%)
    if (overround >= 100) return 'text-amber-400' // Rischioso (margine 0-7%)
    return 'text-red-500' // In perdita (matematicamente regali soldi)
  }

  return (
    <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>🏟️</span> Nuova Partita
      </h2>
      <ActionForm actionFunc={createMatch} successMessage="Partita creata con successo!" className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <div className="w-full">
            <label className="text-xs text-slate-400 mb-1 block font-medium">Squadra di Casa</label>
            <select name="team_a_id" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all" required>
              <option value="">Seleziona...</option>
              {teams?.map(t => <option key={t.id} value={t.id}>{t.name} (PR: {t.power_ranking})</option>)}
            </select>
          </div>
          <div className="w-full">
            <label className="text-xs text-slate-400 mb-1 block font-medium">Squadra in Trasferta</label>
            <select name="team_b_id" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all" required>
              <option value="">Seleziona...</option>
              {teams?.map(t => <option key={t.id} value={t.id}>{t.name} (PR: {t.power_ranking})</option>)}
            </select>
          </div>
          <div className="w-full">
            <label className="text-xs text-slate-400 mb-1 block font-medium">Data e Ora Inizio</label>
            <div className="relative">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="Ora"
                dateFormat="dd/MM/yyyy HH:mm"
                customInput={<CustomDateInput className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-left" />}
                wrapperClassName="w-full"
                required
              />
            </div>
            {/* Hidden input to pass the date to FormData in ActionForm */}
            <input type="hidden" name="start_time" value={startDate ? startDate.toISOString() : ''} />
          </div>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4">
            {overround !== null && (
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Lavagna (Margine)</p>
                <p className={`text-xl font-black ${getOverroundColor()}`}>{overround.toFixed(1)}%</p>
                <p className="text-[9px] text-slate-600 mt-1 italic">
                  {overround > 107 ? '✓ Sicuro per il banco' : overround >= 100 ? '⚠ Margine ridotto' : '❌ In perdita matematica!'}
                </p>
              </div>
            )}
          </div>

          <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-widest flex items-center gap-2">
            <span>⚖️</span> Calcolatore Quote 1X2
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block font-bold uppercase">Quota 1 (Casa)</label>
              <div className="relative">
                <input 
                  name="odd_1" 
                  type="number" 
                  step="0.01" 
                  value={odd1}
                  onChange={(e) => setOdd1(e.target.value)}
                  placeholder="Es: 1.74" 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all" 
                  required 
                />
                {odd1 && (
                  <button 
                    type="button"
                    onClick={() => suggestOdds(odd1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white px-2 py-1 rounded font-bold transition-all uppercase"
                    title="Suggerisci X e 2 basandoti su questa quota"
                  >
                    Magic ✨
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block font-bold uppercase">Quota X (Pareggio)</label>
              <input 
                name="odd_x" 
                type="number" 
                step="0.01" 
                value={oddX}
                onChange={(e) => setOddX(e.target.value)}
                placeholder="Es: 3.40" 
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all" 
                required 
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block font-bold uppercase">Quota 2 (Trasferta)</label>
              <input 
                name="odd_2" 
                type="number" 
                step="0.01" 
                value={odd2}
                onChange={(e) => setOdd2(e.target.value)}
                placeholder="Es: 4.30" 
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all" 
                required 
              />
            </div>
          </div>
          
          <p className="text-[10px] text-slate-500 mt-4 leading-relaxed italic">
            💡 <strong>Tip:</strong> Inserisci la quota per la favorita (1) e clicca "Magic" per calcolare automaticamente X e 2 con un margine di sicurezza del 10% per il banco.
          </p>
        </div>

        <button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black py-4 px-12 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 uppercase tracking-widest text-sm hover:scale-[1.01] active:scale-95">
          Crea Partita con Quote Sicure
        </button>
      </ActionForm>
    </div>
  )
}
