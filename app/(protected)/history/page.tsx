import { createClient } from '@/lib/supabase/server'

export default async function HistoryPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: bets, error } = await supabase
    .from('bets')
    .select(`
      *,
      match:matches!match_id (
        start_time,
        team_a:teams!team_a_id(name),
        team_b:teams!team_b_id(name)
      ),
      odd:odds!odd_id (
        description,
        value
      )
    `)
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300 tracking-tight drop-shadow-md">Storico Giocate</h1>
      
      <div className="bg-slate-900/30 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        {bets && bets.length > 0 ? (
          <div className="divide-y divide-white/10">
            {bets.map((bet: any) => (
              <div key={bet.id} className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors">
                <div className="flex-1">
                  <p className="text-xs text-indigo-300 font-bold mb-1 uppercase tracking-wider drop-shadow-sm">
                    {new Date(bet.created_at).toLocaleString('it-IT')}
                  </p>
                  <p className="text-xl font-bold text-white drop-shadow-md">
                    {bet.match.team_a.name} <span className="text-indigo-400 mx-1">vs</span> {bet.match.team_b.name}
                  </p>
                  <p className="text-sm text-slate-300 mt-2 bg-slate-900/40 inline-block px-3 py-1.5 rounded-lg border border-white/5">
                    Pronostico: <span className="font-bold text-indigo-300">{bet.odd.description}</span> a quota <span className="font-bold text-indigo-300">{bet.odd.value}</span>
                  </p>
                </div>
                
                <div className="flex items-center gap-6 bg-slate-900/40 p-4 rounded-2xl border border-white/5">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Importo</p>
                    <p className="font-bold text-white text-lg">{bet.amount_gp} <span className="text-sm text-slate-400">GC</span></p>
                  </div>
                  <div className="text-right border-l border-white/10 pl-6">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Vincita Pot.</p>
                    <p className="font-black text-indigo-400 text-lg drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]">{Math.floor(bet.amount_gp * bet.odd.value)} <span className="text-sm text-indigo-400/50">GC</span></p>
                  </div>
                  <div className="min-w-[110px] text-center border-l border-white/10 pl-6">
                    <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md inline-block w-full
                      ${bet.status === 'pending' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-orange-500/10' : 
                        bet.status === 'won' ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-green-500/10' : 
                        'bg-red-500/20 text-red-400 border border-red-500/30 shadow-red-500/10'}
                    `}>
                      {bet.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center">
            <span className="text-5xl drop-shadow-md mb-4 block">👻</span>
            <p className="text-indigo-200/60 font-medium">Non hai ancora effettuato nessuna giocata.</p>
          </div>
        )}
      </div>
    </div>
  )
}
