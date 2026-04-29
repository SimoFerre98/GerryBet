import { createClient } from '@/lib/supabase/server'
import { placeBet } from '@/app/actions/bets'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: match, error } = await supabase
    .from('matches')
    .select(`
      *,
      team_a:teams!team_a_id(name),
      team_b:teams!team_b_id(name),
      odds (*)
    `)
    .eq('id', id)
    .single()

  if (error || !match) {
    notFound()
  }

  // Also fetch user profile for max GP
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('gerry_points')
    .eq('id', user?.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <Link href="/matches" className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-1 mb-4">
          ← Torna al Palinsesto
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white text-center">
          <p className="text-indigo-100 font-semibold mb-2 text-sm md:text-base">
            {new Date(match.start_time).toLocaleString('it-IT', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
            })}
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-3xl md:text-5xl font-black">
            <span className="flex-1 text-center md:text-right text-white">{match.team_a.name}</span>
            <span className="text-indigo-200 text-2xl px-4">vs</span>
            <span className="flex-1 text-center md:text-left text-white">{match.team_b.name}</span>
          </div>
        </div>
        
        <div className="p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Piazza la tua scommessa</h2>
          
          <form action={placeBet} className="space-y-8">
            <input type="hidden" name="match_id" value={match.id} />
            
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">1. Scegli la quota</label>
              {match.odds && match.odds.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {match.odds.map((odd: any) => (
                    <label key={odd.id} className="relative cursor-pointer">
                      <input type="radio" name="odd_id" value={odd.id} className="peer sr-only" required />
                      <div className="p-4 rounded-xl border-2 border-slate-200 peer-checked:border-indigo-600 peer-checked:bg-indigo-50 hover:bg-slate-50 transition-all flex flex-col items-center justify-center text-center">
                        <span className="text-slate-500 font-medium text-sm mb-1">{odd.description}</span>
                        <span className="text-xl font-black text-slate-800 peer-checked:text-indigo-700">{odd.value}</span>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">Nessuna quota disponibile per questa partita.</p>
              )}
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">2. Inserisci l'importo (GP)</label>
              <div className="flex items-center gap-4 max-w-xs">
                <input 
                  type="number" 
                  name="amount_gp" 
                  min="1" 
                  max={profile?.gerry_points || 0}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-lg font-bold"
                  placeholder="Es. 10" 
                  required 
                />
                <span className="font-bold text-slate-500">GP</span>
              </div>
              <p className="text-sm text-slate-500">
                Saldo disponibile: <span className="font-bold text-indigo-600">{profile?.gerry_points} GP</span>
              </p>
            </div>

            <button 
              type="submit" 
              className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-transform transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!match.odds || match.odds.length === 0}
            >
              Conferma Giocata
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
