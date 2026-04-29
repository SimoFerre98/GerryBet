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
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-600 tracking-tight drop-shadow-md mb-2">
          Hall of Fame
        </h1>
        <p className="text-indigo-900/60 font-medium">I migliori scommettitori del torneo.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* TOP Scommettitori */}
        <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/60 shadow-xl shadow-indigo-100/30">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">💰</span>
            <h2 className="text-2xl font-bold text-indigo-950">I Più Ricchi</h2>
          </div>
          
          <ul className="space-y-4">
            {topPlayers?.map((p, index) => (
              <li key={p.id} className="bg-white/60 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                <span className={`w-8 h-8 flex items-center justify-center rounded-full font-black text-sm
                  ${index === 0 ? 'bg-yellow-400 text-yellow-900' : 
                    index === 1 ? 'bg-slate-300 text-slate-700' : 
                    index === 2 ? 'bg-orange-300 text-orange-900' : 
                    'bg-indigo-100 text-indigo-500'}
                `}>
                  {index + 1}
                </span>
                <span className="flex-1 font-bold text-slate-800">{p.username || 'Utente'}</span>
                <span className="font-black text-indigo-600">{p.gerry_points} GP</span>
              </li>
            ))}
          </ul>
        </div>

        {/* IL CECCHINO */}
        <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/60 shadow-xl shadow-indigo-100/30">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🎯</span>
            <div>
              <h2 className="text-2xl font-bold text-indigo-950">Il Cecchino</h2>
              <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest">Miglior % di Vincita (Min. 3 Giocate)</p>
            </div>
          </div>
          
          {cecchini.length > 0 ? (
            <ul className="space-y-4">
              {cecchini.map((c, index) => (
                <li key={index} className="bg-white/60 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <span className="text-2xl">{index === 0 ? '👑' : '⭐'}</span>
                  <div className="flex-1">
                    <span className="block font-bold text-slate-800">{c.username}</span>
                    <span className="text-xs font-semibold text-slate-500">{c.won} vinte su {c.total}</span>
                  </div>
                  <span className="font-black text-green-600">{c.winRate.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          ) : (
             <div className="py-10 text-center">
               <p className="text-slate-500 italic">Ancora poche giocate registrate per stabilire il Cecchino.</p>
             </div>
          )}
        </div>

      </div>
    </div>
  )
}
