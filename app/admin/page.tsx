import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch some basic stats
  const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: matchesCount } = await supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'open')
  const { data: bets } = await supabase.from('bets').select('amount_gp, status')

  const totalGPCirculation = bets?.reduce((acc, bet) => acc + bet.amount_gp, 0) || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Dashboard di Riepilogo</h1>
      <p className="text-slate-400">Pannello di controllo del torneo GerryBet.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-lg">
          <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider">Utenti Iscritti</h3>
          <p className="text-4xl font-bold text-white mt-2">{usersCount || 0}</p>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-lg">
          <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider">Partite Aperte</h3>
          <p className="text-4xl font-bold text-white mt-2">{matchesCount || 0}</p>
        </div>
        
        <div className="bg-indigo-900 border border-indigo-700 p-6 rounded-2xl shadow-lg">
          <h3 className="text-indigo-200 font-medium text-sm uppercase tracking-wider">Flusso GC Scommessi</h3>
          <p className="text-4xl font-black text-white mt-2">{totalGPCirculation} GC</p>
        </div>
      </div>
    </div>
  )
}
