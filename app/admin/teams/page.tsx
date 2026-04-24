import { createClient } from '@/lib/supabase/server'
import { createTeam, addPlayer } from '@/app/actions/admin_entities'

export default async function AdminTeamsPage() {
  const supabase = await createClient()

  // Fetch teams with players count
  const { data: teams } = await supabase
    .from('teams')
    .select(`
      *,
      players (*)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Gestione Squadre</h1>
        <p className="text-slate-400">Aggiungi squadre e giocatori per calcolare il Power Ranking.</p>
      </div>

      {/* Creazione Squadra */}
      <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">Nuova Squadra</h2>
        <form action={createTeam} className="flex flex-col md:flex-row gap-4">
          <input 
            name="name" 
            placeholder="Nome Squadra" 
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" 
            required 
          />
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-colors">
            Crea
          </button>
        </form>
      </div>

      {/* Lista Squadre e Aggiunta Giocatori */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams?.map(team => (
          <div key={team.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-700 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-white">{team.name}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase text-slate-500 font-bold tracking-widest block">Power Score</span>
                <span className="text-3xl font-bold text-indigo-400">{team.power_ranking}</span>
              </div>
            </div>
            
            <div className="p-6 bg-slate-900/30 flex-1">
              <h4 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Giocatori ({team.players.length})</h4>
              {team.players.length > 0 ? (
                <ul className="space-y-2 mb-6">
                  {team.players.map((p: { id: string; name: string; category: string }) => (
                    <li key={p.id} className="flex justify-between text-sm items-center bg-slate-800 px-3 py-2 rounded-lg border border-slate-700/50">
                      <span className="text-slate-200">{p.name}</span>
                      <span className="text-indigo-300 text-xs font-mono bg-indigo-900/50 px-2 py-0.5 rounded">
                        {p.category === 'Eccellenza' ? '+4' : 
                         p.category === 'Promozione' ? '+3' : 
                         p.category === 'Prima Categoria' ? '+2' : '+1'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 italic mb-6">Nessun giocatore registrato.</p>
              )}

              <form action={addPlayer} className="mt-auto space-y-3">
                <input type="hidden" name="team_id" value={team.id} />
                <div className="flex gap-2">
                  <input 
                    name="name" 
                    placeholder="Nome Giocatore" 
                    className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" 
                    required 
                  />
                  <select 
                    name="category" 
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Altro/Amatoriale">+1</option>
                    <option value="Prima Categoria">+2</option>
                    <option value="Promozione">+3</option>
                    <option value="Eccellenza">+4</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-slate-700 hover:bg-indigo-600 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors">
                  Aggiungi Giocatore
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
