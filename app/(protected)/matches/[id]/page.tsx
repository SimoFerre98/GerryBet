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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div>
        <Link href="/matches" className="text-indigo-300 hover:text-white font-medium text-sm flex items-center gap-1 mb-4 drop-shadow-sm transition-colors">
          ← Torna al Palinsesto
        </Link>
      </div>

      <div className="bg-slate-900/30 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden relative">
        <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-b border-white/10 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          <p className="text-indigo-200 font-semibold mb-2 text-sm md:text-base tracking-widest uppercase drop-shadow-sm">
            {new Date(match.start_time).toLocaleString('it-IT', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
            })}
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-4xl md:text-5xl font-black">
            <span className="flex-1 text-center md:text-right text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{match.team_a.name}</span>
            <span className="text-indigo-400 text-2xl px-6 font-bold bg-slate-900/50 rounded-xl py-2 border border-white/10 shadow-inner">vs</span>
            <span className="flex-1 text-center md:text-left text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{match.team_b.name}</span>
          </div>
        </div>
        
        <div className="p-6 md:p-10">
          {new Date(match.start_time) <= new Date() ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
              <span className="text-4xl mb-4 block">🕒</span>
              <h3 className="text-xl font-bold text-red-400 mb-2">Scommesse Chiuse</h3>
              <p className="text-slate-400">La partita è già iniziata. Non è più possibile piazzare giocate per questo evento.</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white mb-8 drop-shadow-md">Piazza la tua scommessa</h2>
              
              <form action={placeBet} className="space-y-8">
                <input type="hidden" name="match_id" value={match.id} />
                
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-slate-300 uppercase tracking-widest">1. Scegli la quota</label>
                  {match.odds && match.odds.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {match.odds
                        .sort((a: any, b: any) => {
                          const order = { '1': 1, 'X': 2, '2': 3 } as any;
                          return order[a.description] - order[b.description];
                        })
                        .map((odd: any) => (
                        <label key={odd.id} className="relative cursor-pointer group">
                          <input type="radio" name="odd_id" value={odd.id} className="peer sr-only" required />
                          <div className="p-5 rounded-2xl border-2 border-white/10 peer-checked:border-indigo-400 peer-checked:bg-indigo-500/20 bg-slate-800/40 hover:bg-slate-700/50 transition-all flex flex-col items-center justify-center text-center shadow-lg hover:shadow-indigo-500/20">
                            <span className="text-indigo-200/80 font-medium text-sm mb-1 uppercase tracking-wider">{odd.description}</span>
                            <span className="text-2xl font-black text-white peer-checked:text-indigo-300 drop-shadow-md">{odd.value}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-indigo-200/50 italic bg-slate-900/50 p-4 rounded-xl border border-white/5">Nessuna quota disponibile per questa partita.</p>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-slate-300 uppercase tracking-widest">2. Inserisci l'importo (GC)</label>
                  <div className="flex items-center gap-4 max-w-xs relative">
                    <input 
                      type="number" 
                      name="amount_gp" 
                      min="1" 
                      max={profile?.gerry_points || 0}
                      className="w-full pl-6 pr-16 py-4 rounded-2xl bg-slate-900/50 border border-white/10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-2xl font-black text-white shadow-inner placeholder:text-slate-600 transition-all"
                      placeholder="0" 
                      required 
                    />
                    <span className="absolute right-6 font-bold text-indigo-400">GC</span>
                  </div>
                  <p className="mt-4 text-xs font-semibold text-slate-400 uppercase tracking-tighter">
                    Saldo disponibile: <span className="font-black text-indigo-300">{profile?.gerry_points} GC</span>
                  </p>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    className="w-full md:w-auto px-10 py-5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-lg font-bold rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
                    disabled={!match.odds || match.odds.length === 0}
                  >
                    Conferma Giocata
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
