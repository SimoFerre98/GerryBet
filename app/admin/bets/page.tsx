import { createClient } from '@/lib/supabase/server'

export default async function AdminBetsPage() {
  const supabase = await createClient()

  // Fetch all bets with related info
  const { data: bets } = await supabase
    .from('bets')
    .select(`
      *,
      profiles(username),
      odds(description, value),
      matches(team_a_id, team_b_id, team_a:teams!team_a_id(name), team_b:teams!team_b_id(name))
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Monitoraggio Scommesse</h1>
        <p className="text-slate-400">Visione globale di tutte le puntate effettuate dagli utenti.</p>
      </div>

      <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs uppercase bg-slate-900/50 text-slate-400 border-b border-slate-700">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Utente</th>
              <th className="px-4 py-3">Partita</th>
              <th className="px-4 py-3">Puntata su</th>
              <th className="px-4 py-3">Quota</th>
              <th className="px-4 py-3">Importo</th>
              <th className="px-4 py-3">Vincita Possibile</th>
              <th className="px-4 py-3">Stato</th>
            </tr>
          </thead>
          <tbody>
            {bets?.map((bet: any) => {
              const potentialWin = Math.floor(bet.amount_gp * (bet.odds?.value || 1))
              return (
                <tr key={bet.id} className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-xs">{new Date(bet.created_at).toLocaleString('it-IT')}</td>
                  <td className="px-4 py-3 font-bold text-indigo-400">{bet.profiles?.username || 'Sconosciuto'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {bet.matches?.team_a?.name} vs {bet.matches?.team_b?.name}
                  </td>
                  <td className="px-4 py-3 font-bold text-center">{bet.odds?.description}</td>
                  <td className="px-4 py-3 font-mono">{bet.odds?.value}</td>
                  <td className="px-4 py-3 font-bold text-white">{bet.amount_gp} GC</td>
                  <td className="px-4 py-3 font-bold text-green-400">{potentialWin} GC</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                      bet.status === 'won' ? 'bg-green-500/20 text-green-400' :
                      bet.status === 'lost' ? 'bg-red-500/20 text-red-400' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {bet.status === 'pending' ? 'In attesa' : bet.status === 'won' ? 'Vinta' : 'Persa'}
                    </span>
                  </td>
                </tr>
              )
            })}
            {(!bets || bets.length === 0) && (
              <tr>
                <td colSpan={8} className="text-center py-6 text-slate-500">Nessuna scommessa trovata</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
