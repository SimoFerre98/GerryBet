import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // ── 1. Basic Counts ──
  const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: openMatchesCount } = await supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'open')
  const { count: closedMatchesCount } = await supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'closed')
  const { count: teamsCount } = await supabase.from('teams').select('*', { count: 'exact', head: true })

  // ── 2. Profiles: GC in circolazione ──
  const { data: profiles } = await supabase.from('profiles').select('id, username, gerry_points, role')
  const totalGCCirculation = profiles?.reduce((acc, p) => acc + (p.gerry_points || 0), 0) || 0
  const avgGCPerUser = usersCount ? Math.round(totalGCCirculation / usersCount) : 0

  // ── 3. Bets: Analisi completa ──
  const { data: allBets } = await supabase
    .from('bets')
    .select('id, user_id, match_id, odd_id, amount_gp, status, odds(value, description)')

  const totalBets = allBets?.length || 0
  const pendingBets = allBets?.filter(b => b.status === 'pending') || []
  const wonBets = allBets?.filter(b => b.status === 'won') || []
  const lostBets = allBets?.filter(b => b.status === 'lost') || []

  const totalWagered = allBets?.reduce((acc, b) => acc + b.amount_gp, 0) || 0
  const avgBet = totalBets > 0 ? Math.round(totalWagered / totalBets) : 0

  // GC persi dagli utenti (= rimangono al banco)
  const totalLostByUsers = lostBets.reduce((acc, b) => acc + b.amount_gp, 0)
  // GC vinti dagli utenti (= pagati dal banco)
  const totalWonByUsers = wonBets.reduce((acc, b) => {
    const oddValue = (b.odds as any)?.value || 1
    return acc + Math.floor(b.amount_gp * oddValue)
  }, 0)
  // Profitto del banco
  const bankProfit = totalLostByUsers - totalWonByUsers

  // Debito potenziale (scommesse pending)
  const potentialPayout = pendingBets.reduce((acc, b) => {
    const oddValue = (b.odds as any)?.value || 1
    return acc + Math.floor(b.amount_gp * oddValue)
  }, 0)

  // ── 4. Distribuzione Esiti (1, X, 2) ──
  const betsOn1 = allBets?.filter(b => (b.odds as any)?.description === '1').length || 0
  const betsOnX = allBets?.filter(b => (b.odds as any)?.description === 'X').length || 0
  const betsOn2 = allBets?.filter(b => (b.odds as any)?.description === '2').length || 0
  const totalOutcomeBets = betsOn1 + betsOnX + betsOn2 || 1 // avoid division by zero
  const pct1 = Math.round((betsOn1 / totalOutcomeBets) * 100)
  const pctX = Math.round((betsOnX / totalOutcomeBets) * 100)
  const pct2 = Math.round((betsOn2 / totalOutcomeBets) * 100)

  // ── 5. Top Winners (per saldo) ──
  const topWinners = (profiles || [])
    .filter(p => p.role !== 'admin')
    .sort((a, b) => (b.gerry_points || 0) - (a.gerry_points || 0))
    .slice(0, 5)

  // ── 6. Top Bettors (per volume scommesso) ──
  const userVolume: Record<string, { username: string, volume: number, count: number }> = {}
  allBets?.forEach(b => {
    if (!userVolume[b.user_id]) {
      const profile = profiles?.find(p => p.id === b.user_id)
      userVolume[b.user_id] = { username: profile?.username || 'Sconosciuto', volume: 0, count: 0 }
    }
    userVolume[b.user_id].volume += b.amount_gp
    userVolume[b.user_id].count += 1
  })
  const topBettors = Object.values(userVolume)
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5)

  // ── 7. Big Match (match con più volume scommesse) ──
  const { data: matchesWithTeams } = await supabase
    .from('matches')
    .select('id, team_a:teams!team_a_id(name), team_b:teams!team_b_id(name), status, result')

  const matchVolume: Record<string, { name: string, volume: number, count: number }> = {}
  allBets?.forEach(b => {
    if (!matchVolume[b.match_id]) {
      const match = matchesWithTeams?.find(m => m.id === b.match_id)
      const teamA = (match?.team_a as any)?.name || '?'
      const teamB = (match?.team_b as any)?.name || '?'
      matchVolume[b.match_id] = { name: `${teamA} vs ${teamB}`, volume: 0, count: 0 }
    }
    matchVolume[b.match_id].volume += b.amount_gp
    matchVolume[b.match_id].count += 1
  })
  const topMatches = Object.values(matchVolume)
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 3)

  // ── 9. Risk Management: Analisi Exposure per Match Aperti ──
  const openMatchIds = matchesWithTeams?.filter(m => m.status === 'open').map(m => m.id) || []
  const riskAnalysis = openMatchIds.map(mId => {
    const match = matchesWithTeams?.find(m => m.id === mId)
    const matchBets = allBets?.filter(b => b.match_id === mId) || []
    const totalCollected = matchBets.reduce((acc, b) => acc + b.amount_gp, 0)
    
    const outcomes = ['1', 'X', '2']
    const exposure = outcomes.map(out => {
      const betsOnOutcome = matchBets.filter(b => (b.odds as any)?.description === out)
      const payout = betsOnOutcome.reduce((acc, b) => {
        const val = (b.odds as any)?.value || 0
        return acc + Math.floor(b.amount_gp * val)
      }, 0)
      return {
        label: out,
        payout,
        net: totalCollected - payout,
        volume: betsOnOutcome.reduce((acc, b) => acc + b.amount_gp, 0)
      }
    })

    return {
      id: mId,
      name: `${(match?.team_a as any)?.name} vs ${(match?.team_b as any)?.name}`,
      totalCollected,
      exposure
    }
  })

  return (
    <div className="space-y-6 md:space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard di Riepilogo</h1>
          <p className="text-slate-400 text-sm md:text-base mt-1">Pannello di controllo del torneo GerryBet.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/matches" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all">
            Gestisci Match
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SEZIONE 1: Overview Cards
          ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
        <StatCard icon="👥" label="Utenti" value={usersCount || 0} />
        <StatCard icon="🏟️" label="Match Aperti" value={openMatchesCount || 0} accent="green" />
        <StatCard icon="✅" label="Match Conclusi" value={closedMatchesCount || 0} />
        <StatCard icon="🛡️" label="Squadre" value={teamsCount || 0} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SEZIONE 1.5: Risk Management (Liability Analysis)
          ═══════════════════════════════════════════════════════════════ */}
      {riskAnalysis.length > 0 && (
        <div className="bg-slate-900/40 border border-slate-700/50 rounded-3xl p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="animate-pulse">🔴</span> Analisi del Rischio (Liability)
            </h2>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-slate-700">
              Real-Time
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {riskAnalysis.map(risk => (
              <div key={risk.id} className="bg-slate-950/50 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/30">
                  <span className="text-sm font-black text-white truncate max-w-[200px]">{risk.name}</span>
                  <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded">
                    Volume: {risk.totalCollected} GC
                  </span>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {risk.exposure.map(exp => {
                      const isAtRisk = exp.net < 0;
                      const pctOfTotal = risk.totalCollected > 0 ? (exp.volume / risk.totalCollected) * 100 : 0;
                      
                      return (
                        <div key={exp.label} className={`p-3 rounded-xl border flex flex-col items-center ${isAtRisk ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-900/50 border-slate-700/30'}`}>
                          <span className="text-[10px] text-slate-500 font-black mb-1 uppercase">{exp.label}</span>
                          <span className={`text-sm font-black ${isAtRisk ? 'text-red-400' : 'text-white'}`}>
                            {exp.net > 0 ? '+' : ''}{exp.net}
                          </span>
                          <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                            <div className={`h-full ${isAtRisk ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${pctOfTotal}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-500 italic text-center">
                    I valori indicano il guadagno/perdita netto del banco per ogni esito finale.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SEZIONE 2: Economia del Torneo
          ═══════════════════════════════════════════════════════════════ */}
      <div>
        <h2 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>💰</span> Economia del Torneo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
          {/* GC in Circolazione */}
          <div className="bg-gradient-to-br from-indigo-900/80 to-indigo-950/80 backdrop-blur-xl border border-indigo-700/50 p-5 md:p-6 rounded-2xl shadow-lg">
            <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">GC in Circolazione</p>
            <p className="text-3xl md:text-4xl font-black text-white mt-2">{totalGCCirculation.toLocaleString()}</p>
            <p className="text-indigo-400/70 text-xs mt-2">Media per utente: <span className="text-white font-bold">{avgGCPerUser} GC</span></p>
          </div>

          {/* Profitto del Banco */}
          <div className={`backdrop-blur-xl border p-5 md:p-6 rounded-2xl shadow-lg ${bankProfit >= 0 ? 'bg-green-900/30 border-green-700/50' : 'bg-red-900/30 border-red-700/50'}`}>
            <p className={`text-xs font-bold uppercase tracking-widest ${bankProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>Profitto del Banco</p>
            <p className={`text-3xl md:text-4xl font-black mt-2 ${bankProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {bankProfit >= 0 ? '+' : ''}{bankProfit.toLocaleString()} <span className="text-lg">GC</span>
            </p>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="text-red-400/80">Incassati: {totalLostByUsers.toLocaleString()}</span>
              <span className="text-green-400/80">Pagati: {totalWonByUsers.toLocaleString()}</span>
            </div>
          </div>

          {/* Debito Potenziale */}
          <div className="bg-amber-900/20 backdrop-blur-xl border border-amber-700/30 p-5 md:p-6 rounded-2xl shadow-lg">
            <p className="text-amber-300 text-xs font-bold uppercase tracking-widest">Debito Potenziale</p>
            <p className="text-3xl md:text-4xl font-black text-amber-400 mt-2">{potentialPayout.toLocaleString()} <span className="text-lg">GC</span></p>
            <p className="text-amber-400/60 text-xs mt-2">{pendingBets.length} scommesse in sospeso</p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SEZIONE 3: Statistiche Scommesse + Distribuzione Esiti
          ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
        {/* Stats Scommesse */}
        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-5 md:p-6 rounded-2xl shadow-lg">
          <h3 className="text-white font-bold text-sm md:text-base mb-4 flex items-center gap-2">
            <span>🎰</span> Statistiche Giocate
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Totale Scommesse</span>
              <span className="text-white font-black text-lg">{totalBets}</span>
            </div>
            <div className="h-px bg-white/5"></div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Volume Totale</span>
              <span className="text-white font-black text-lg">{totalWagered.toLocaleString()} GC</span>
            </div>
            <div className="h-px bg-white/5"></div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Scommessa Media</span>
              <span className="text-white font-black text-lg">{avgBet} GC</span>
            </div>
            <div className="h-px bg-white/5"></div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Win Rate Utenti</span>
              <span className={`font-black text-lg ${winRate > 50 ? 'text-green-400' : winRate > 30 ? 'text-amber-400' : 'text-red-400'}`}>{winRate}%</span>
            </div>
            <div className="h-px bg-white/5"></div>
            {/* Mini progress bars for status breakdown */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="text-center">
                <p className="text-amber-400 font-black text-lg">{pendingBets.length}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-green-400 font-black text-lg">{wonBets.length}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Vinte</p>
              </div>
              <div className="text-center">
                <p className="text-red-400 font-black text-lg">{lostBets.length}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Perse</p>
              </div>
            </div>
          </div>
        </div>

        {/* Distribuzione Esiti - Donut Chart via CSS */}
        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-5 md:p-6 rounded-2xl shadow-lg">
          <h3 className="text-white font-bold text-sm md:text-base mb-4 flex items-center gap-2">
            <span>📊</span> Distribuzione Esiti Scommessi
          </h3>
          <div className="flex flex-col items-center gap-6">
            {/* CSS Donut Chart */}
            <div className="relative w-40 h-40 md:w-48 md:h-48">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {/* Background ring */}
                <circle cx="18" cy="18" r="15.91" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                {/* Esito 1 */}
                <circle cx="18" cy="18" r="15.91" fill="none" stroke="#818cf8" strokeWidth="3"
                  strokeDasharray={`${pct1} ${100 - pct1}`} strokeDashoffset="0" className="transition-all duration-1000" />
                {/* Esito X */}
                <circle cx="18" cy="18" r="15.91" fill="none" stroke="#fbbf24" strokeWidth="3"
                  strokeDasharray={`${pctX} ${100 - pctX}`} strokeDashoffset={`${-pct1}`} className="transition-all duration-1000" />
                {/* Esito 2 */}
                <circle cx="18" cy="18" r="15.91" fill="none" stroke="#f87171" strokeWidth="3"
                  strokeDasharray={`${pct2} ${100 - pct2}`} strokeDashoffset={`${-(pct1 + pctX)}`} className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl md:text-3xl font-black text-white">{totalBets}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">giocate</p>
              </div>
            </div>
            {/* Legend */}
            <div className="flex gap-4 md:gap-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-400"></span>
                <span className="text-sm text-slate-300"><span className="font-black text-white">{pct1}%</span> Casa</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                <span className="text-sm text-slate-300"><span className="font-black text-white">{pctX}%</span> Pareggio</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                <span className="text-sm text-slate-300"><span className="font-black text-white">{pct2}%</span> Trasferta</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SEZIONE 4: Classifiche
          ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
        {/* Top Winners */}
        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-5 md:p-6 rounded-2xl shadow-lg">
          <h3 className="text-white font-bold text-sm md:text-base mb-4 flex items-center gap-2">
            <span>🏆</span> Top 5 Saldi
          </h3>
          <div className="space-y-3">
            {topWinners.length > 0 ? topWinners.map((user, i) => {
              const maxGP = topWinners[0]?.gerry_points || 1
              const barWidth = Math.max(((user.gerry_points || 0) / maxGP) * 100, 8)
              const medals = ['🥇', '🥈', '🥉']
              return (
                <div key={user.id} className="flex items-center gap-3">
                  <span className="w-6 text-center text-sm">{medals[i] || <span className="text-slate-600 font-bold">{i + 1}</span>}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-white font-medium truncate">{user.username || 'Anonimo'}</span>
                      <span className="text-sm text-indigo-300 font-black ml-2 shrink-0">{user.gerry_points} GC</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900/80 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700" style={{ width: `${barWidth}%` }}></div>
                    </div>
                  </div>
                </div>
              )
            }) : (
              <p className="text-slate-500 text-sm italic">Nessun utente registrato.</p>
            )}
          </div>
        </div>

        {/* Top Bettors by Volume */}
        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-5 md:p-6 rounded-2xl shadow-lg">
          <h3 className="text-white font-bold text-sm md:text-base mb-4 flex items-center gap-2">
            <span>🎲</span> Top 5 Scommettitori
          </h3>
          <div className="space-y-3">
            {topBettors.length > 0 ? topBettors.map((user, i) => {
              const maxVol = topBettors[0]?.volume || 1
              const barWidth = Math.max((user.volume / maxVol) * 100, 8)
              const medals = ['🥇', '🥈', '🥉']
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 text-center text-sm">{medals[i] || <span className="text-slate-600 font-bold">{i + 1}</span>}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-white font-medium truncate">{user.username}</span>
                      <span className="text-sm text-emerald-300 font-black ml-2 shrink-0">{user.volume} GC <span className="text-slate-500 font-normal text-xs">({user.count} bet)</span></span>
                    </div>
                    <div className="w-full h-2 bg-slate-900/80 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700" style={{ width: `${barWidth}%` }}></div>
                    </div>
                  </div>
                </div>
              )
            }) : (
              <p className="text-slate-500 text-sm italic">Nessuna scommessa piazzata.</p>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SEZIONE 5: Big Match
          ═══════════════════════════════════════════════════════════════ */}
      {topMatches.length > 0 && (
        <div>
          <h2 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🔥</span> Match più Seguiti
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
            {topMatches.map((m, i) => (
              <div key={i} className={`p-5 rounded-2xl border shadow-lg ${i === 0 ? 'bg-gradient-to-br from-amber-900/30 to-amber-950/30 border-amber-700/40' : 'bg-slate-800/60 border-slate-700/50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{i === 0 ? '🏅' : i === 1 ? '🥈' : '🥉'}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${i === 0 ? 'text-amber-400' : 'text-slate-400'}`}>#{i + 1} più scommesso</span>
                </div>
                <p className="text-white font-bold text-sm md:text-base truncate">{m.name}</p>
                <div className="flex gap-4 mt-3">
                  <div>
                    <p className={`text-xl md:text-2xl font-black ${i === 0 ? 'text-amber-400' : 'text-indigo-400'}`}>{m.volume.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 uppercase">GC totali</p>
                  </div>
                  <div>
                    <p className={`text-xl md:text-2xl font-black ${i === 0 ? 'text-amber-400' : 'text-indigo-400'}`}>{m.count}</p>
                    <p className="text-[10px] text-slate-500 uppercase">Giocate</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SEZIONE 6: Quick Actions
          ═══════════════════════════════════════════════════════════════ */}
      <div>
        <h2 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>⚡</span> Azioni Rapide
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/admin/users" className="bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 hover:border-indigo-500/30 p-4 md:p-5 rounded-2xl transition-all duration-300 text-center group">
            <span className="text-2xl md:text-3xl block mb-2 group-hover:scale-110 transition-transform">👥</span>
            <span className="text-white font-bold text-xs md:text-sm">Gestione Utenti</span>
          </Link>
          <Link href="/admin/teams" className="bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 hover:border-indigo-500/30 p-4 md:p-5 rounded-2xl transition-all duration-300 text-center group">
            <span className="text-2xl md:text-3xl block mb-2 group-hover:scale-110 transition-transform">🛡️</span>
            <span className="text-white font-bold text-xs md:text-sm">Gestione Squadre</span>
          </Link>
          <Link href="/admin/matches" className="bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 hover:border-indigo-500/30 p-4 md:p-5 rounded-2xl transition-all duration-300 text-center group">
            <span className="text-2xl md:text-3xl block mb-2 group-hover:scale-110 transition-transform">🏟️</span>
            <span className="text-white font-bold text-xs md:text-sm">Gestione Partite</span>
          </Link>
          <Link href="/dashboard" className="bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 hover:border-indigo-500/30 p-4 md:p-5 rounded-2xl transition-all duration-300 text-center group">
            <span className="text-2xl md:text-3xl block mb-2 group-hover:scale-110 transition-transform">🔙</span>
            <span className="text-white font-bold text-xs md:text-sm">Torna all'App</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Componente StatCard riutilizzabile ──
function StatCard({ icon, label, value, accent }: { icon: string, label: string, value: number, accent?: string }) {
  const accentColors: Record<string, string> = {
    green: 'border-green-700/50 bg-green-900/20',
    red: 'border-red-700/50 bg-red-900/20',
    amber: 'border-amber-700/50 bg-amber-900/20',
  }
  const baseStyle = accent && accentColors[accent]
    ? accentColors[accent]
    : 'border-slate-700/50 bg-slate-800/60'

  return (
    <div className={`backdrop-blur-xl border p-4 md:p-5 rounded-2xl shadow-lg ${baseStyle}`}>
      <div className="flex items-center gap-2 md:gap-3">
        <span className="text-xl md:text-2xl">{icon}</span>
        <div>
          <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">{label}</p>
          <p className="text-2xl md:text-3xl font-black text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}
