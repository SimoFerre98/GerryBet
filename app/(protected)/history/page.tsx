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
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Storico Giocate</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {bets && bets.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {bets.map((bet: any) => (
              <div key={bet.id} className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-slate-500 mb-1">
                    {new Date(bet.created_at).toLocaleString('it-IT')}
                  </p>
                  <p className="font-bold text-slate-800">
                    {bet.match.team_a.name} vs {bet.match.team_b.name}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    Pronostico: <span className="font-bold">{bet.odd.description}</span> a quota <span className="font-bold">{bet.odd.value}</span>
                  </p>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Importo</p>
                    <p className="font-bold text-slate-800">{bet.amount_gp} GP</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Vincita Potenziale</p>
                    <p className="font-bold text-indigo-600">{Math.floor(bet.amount_gp * bet.odd.value)} GP</p>
                  </div>
                  <div className="min-w-[100px] text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                      ${bet.status === 'pending' ? 'bg-orange-100 text-orange-700' : 
                        bet.status === 'won' ? 'bg-green-100 text-green-700' : 
                        'bg-red-100 text-red-700'}
                    `}>
                      {bet.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            <p>Non hai ancora effettuato nessuna giocata.</p>
          </div>
        )}
      </div>
    </div>
  )
}
