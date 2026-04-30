'use client'

import { useState } from 'react'
import { placeBet } from '@/app/actions/bets'
import toast from 'react-hot-toast'

import { useRouter } from 'next/navigation'

interface Props {
  matchId: string
  odds: any[]
  availablePoints: number
}

export default function BetForm({ matchId, odds, availablePoints }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    try {
      await placeBet(formData)
      toast.success('Scommessa piazzata con successo! Buona fortuna 🍀')
      // Aspetta un momento prima di ridirigere per far vedere il toast
      setTimeout(() => {
        router.push('/history')
        router.refresh()
      }, 1500)
    } catch (e: any) {
      toast.error(e.message || 'Errore durante il piazzamento della scommessa')
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      <input type="hidden" name="match_id" value={matchId} />
      
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-slate-300 uppercase tracking-widest">1. Scegli la quota</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {odds
            .sort((a, b) => {
              const order: any = { '1': 1, 'X': 2, '2': 3 }
              return order[a.description] - order[b.description]
            })
            .map((odd) => (
            <label key={odd.id} className="relative cursor-pointer group">
              <input type="radio" name="odd_id" value={odd.id} className="peer sr-only" required />
              <div className="p-5 rounded-2xl border-2 border-white/10 peer-checked:border-indigo-400 peer-checked:bg-indigo-500/20 bg-slate-800/40 hover:bg-slate-700/50 transition-all flex flex-col items-center justify-center text-center shadow-lg hover:shadow-indigo-500/20">
                <span className="text-indigo-200/80 font-medium text-sm mb-1 uppercase tracking-wider">{odd.description}</span>
                <span className="text-2xl font-black text-white peer-checked:text-indigo-300 drop-shadow-md">{odd.value}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-semibold text-slate-300 uppercase tracking-widest">2. Inserisci l'importo (GC)</label>
        <div className="flex items-center gap-4 max-w-xs relative">
          <input 
            type="number" 
            name="amount_gp" 
            min="1" 
            max={availablePoints}
            className="w-full pl-6 pr-16 py-4 rounded-2xl bg-slate-900/50 border border-white/10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-2xl font-black text-white shadow-inner placeholder:text-slate-600 transition-all"
            placeholder="0" 
            required 
          />
          <span className="absolute right-6 font-bold text-indigo-400">GC</span>
        </div>
        <p className="mt-4 text-xs font-semibold text-slate-400 uppercase tracking-tighter">
          Saldo disponibile: <span className="font-black text-indigo-300">{availablePoints} GC</span>
        </p>
      </div>

      <div className="pt-4">
        <button 
          type="submit" 
          disabled={loading}
          className="w-full md:w-auto px-10 py-5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-lg font-bold rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
        >
          {loading ? 'Elaborazione...' : 'Conferma Giocata'}
        </button>
      </div>
    </form>
  )
}
