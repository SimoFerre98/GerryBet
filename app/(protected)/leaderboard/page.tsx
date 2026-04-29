import { createClient } from '@/lib/supabase/server'

export default async function LeaderboardPage() {
  const supabase = await createClient()

  // Top Scommettitori (per GP totali)
  const { data: topPlayers } = await supabase
    .from('profiles')
    .select('id, username, gerry_points')
    .order('gerry_points', { ascending: false })
    .limit(10)

  // Calcolo Cecchino
  // Otteniamo la lista di scommesse raggruppate per utente in modo grezzo
  // Idealmente si farebbe in una view / RPC ma qui possiamo aggregarlo a livello JS per V1.
  const { data: bets } = await supabase
    .from('bets')
    .select('user_id, status, profiles(username)')
    
  interface Stats {
    username: string;
    total: number;
    won: number;
  }
  const userStats = new Map<string, Stats>();
  
  if (bets) {
    bets.forEach((bet: any) => {
      const uid = bet.user_id;
      if (!userStats.has(uid)) {
        userStats.set(uid, { username: bet.profiles.username || 'Anonimo', total: 0, won: 0 });
      }
      const stat = userStats.get(uid)!;
      stat.total += 1;
      if (bet.status === 'won') stat.won += 1;
    });
  }

  // Il Cecchino (Win Rate)
  const cecchini = Array.from(userStats.values())
    .filter(s => s.total >= 3) // Minimo 3 giocate per essere in classifica
    .map(s => ({
      ...s,
      winRate: (s.won / s.total) * 100
    }))
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 5)

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 tracking-tight drop-shadow-[0_0_25px_rgba(251,191,36,0.3)] mb-2">
          Hall of Fame
        </h1>
        <p className="text-indigo-200/80 font-medium">I migliori scommettitori del torneo.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* TOP Scommettitori */}
        <div className="relative overflow-hidden bg-slate-900/30 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl drop-shadow-md">💰</span>
            <h2 className="text-2xl font-bold text-white drop-shadow-md">I Più Ricchi</h2>
          </div>
          
          <ul className="space-y-4">
            {topPlayers?.map((p, index) => (
              <li key={p.id} className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 hover:bg-slate-700/50 hover:shadow-lg hover:border-indigo-400/30 border border-white/5 transition-all duration-300">
                <span className={`w-8 h-8 flex items-center justify-center rounded-full font-black text-sm shadow-md
                  ${index === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-950 shadow-yellow-500/50' : 
                    index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800 shadow-slate-400/50' : 
                    index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-500 text-orange-950 shadow-orange-500/50' : 
                    'bg-slate-800 border border-indigo-500/50 text-indigo-300'}
                `}>
                  {index + 1}
                </span>
                <span className="flex-1 font-bold text-slate-100">{p.username || 'Utente'}</span>
                <span className="font-black text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]">{p.gerry_points} GP</span>
              </li>
            ))}
          </ul>
        </div>

        {/* IL CECCHINO */}
        <div className="relative overflow-hidden bg-slate-900/30 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl drop-shadow-md">🎯</span>
            <div>
              <h2 className="text-2xl font-bold text-white drop-shadow-md">Il Cecchino</h2>
              <p className="text-xs text-indigo-300 font-medium mt-1 uppercase tracking-widest">Miglior % di Vincita (Min. 3 Giocate)</p>
            </div>
          </div>
          
          {cecchini.length > 0 ? (
            <ul className="space-y-4">
              {cecchini.map((c, index) => (
                <li key={index} className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 hover:bg-slate-700/50 hover:shadow-lg hover:border-green-400/30 border border-white/5 transition-all duration-300">
                  <span className="text-2xl drop-shadow-md">{index === 0 ? '👑' : '⭐'}</span>
                  <div className="flex-1">
                    <span className="block font-bold text-slate-100">{c.username}</span>
                    <span className="text-xs font-semibold text-slate-400">{c.won} vinte su {c.total}</span>
                  </div>
                  <span className="font-black text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">{c.winRate.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          ) : (
             <div className="py-10 text-center">
               <p className="text-slate-400 italic">Ancora poche giocate registrate per stabilire il Cecchino.</p>
             </div>
          )}
        </div>

      </div>
    </div>
  )
}
