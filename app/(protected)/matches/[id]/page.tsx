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
        <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-b border-white/10 p-6 md:p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          <p className="text-indigo-200 font-semibold mb-3 md:mb-2 text-xs md:text-base tracking-widest uppercase drop-shadow-sm">
            {new Date(match.start_time).toLocaleString('it-IT', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
            })}
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-2xl md:text-5xl font-black">
            <span className="flex-1 text-center md:text-right text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{match.team_a?.name || 'Squadra A'}</span>
            <span className="text-indigo-400 text-sm md:text-2xl px-4 md:px-6 font-bold bg-slate-900/50 rounded-xl py-1 md:py-2 border border-white/10 shadow-inner">vs</span>
            <span className="flex-1 text-center md:text-left text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{match.team_b?.name || 'Squadra B'}</span>
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
              
              <BetForm 
                matchId={match.id} 
                odds={match.odds || []} 
                availablePoints={profile?.gerry_points || 0} 
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
