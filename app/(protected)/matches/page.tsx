import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function MatchesPage() {
  const supabase = await createClient()

  const { data: matches, error } = await supabase
    .from('matches')
    .select(`
      *,
      team_a:teams!team_a_id(name),
      team_b:teams!team_b_id(name)
    `)
    .eq('status', 'open')
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching matches:', error)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300 tracking-tight drop-shadow-md">Palinsesto</h1>
      </div>

      <div className="grid gap-6">
        {matches && matches.length > 0 ? (
          matches.map((match) => {
            const hasStarted = new Date(match.start_time) <= new Date();
            
            return (
              <Link 
                key={match.id} 
                href={hasStarted ? '#' : `/matches/${match.id}`}
                className={`relative overflow-hidden bg-slate-900/30 backdrop-blur-2xl rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-6 block group ${hasStarted ? 'opacity-60 cursor-not-allowed' : 'hover:bg-slate-800/40 hover:border-indigo-400/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1'}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="flex-1 text-center md:text-left relative z-10">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <p className="text-sm text-indigo-300 font-bold uppercase tracking-widest drop-shadow-md">
                      {new Date(match.start_time).toLocaleString('it-IT', { 
                        weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </p>
                    {hasStarted && (
                      <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter animate-pulse">Iniziata</span>
                    )}
                  </div>
                  <div className="text-3xl font-black text-white flex justify-center md:justify-start items-center gap-4 w-full drop-shadow-md">
                    <span className="flex-1 md:flex-initial text-right">{match.team_a.name}</span>
                    <span className="text-indigo-400 text-xl mx-2 font-bold bg-indigo-950/50 px-3 py-1 rounded-lg border border-indigo-500/30 shadow-inner">VS</span>
                    <span className="flex-1 md:flex-initial text-left">{match.team_b.name}</span>
                  </div>
                </div>
                <div className={`relative z-10 px-8 py-4 rounded-2xl font-bold uppercase tracking-wide text-sm whitespace-nowrap shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 border border-white/20 ${hasStarted ? 'bg-slate-800 text-slate-500 shadow-none grayscale' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white group-hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] group-hover:scale-105'}`}>
                  {hasStarted ? 'Scommesse Chiuse' : 'Scommetti Ora'}
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-16 bg-slate-900/30 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <span className="text-5xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">🏟️</span>
            <h3 className="mt-6 text-2xl font-bold text-white drop-shadow-md">Nessuna partita disponibile</h3>
            <p className="text-indigo-200/60 mt-2 font-medium">Torna più tardi per scoprire il nuovo palinsesto.</p>
          </div>
        )}
      </div>
    </div>
  )
}
