import { createClient } from '@/lib/supabase/server'
import { createTeam, addPlayer, deleteTeam, updateTeam, deletePlayer, updatePlayer } from '@/app/actions/admin_entities'
import { ActionForm } from '@/app/admin/components/ActionForm'

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
        <ActionForm actionFunc={createTeam} successMessage="Squadra creata con successo!" className="flex flex-col md:flex-row gap-4">
          <input 
            name="name" 
            placeholder="Nome Squadra" 
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" 
            required 
          />
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-colors">
            Crea
          </button>
        </ActionForm>
      </div>

      {/* Lista Squadre e Aggiunta Giocatori */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams?.map(team => (
          <div key={team.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-700 flex justify-between items-start gap-4">
              <div className="flex-1 pr-4">
                <ActionForm actionFunc={updateTeam} successMessage="Nome squadra aggiornato" className="mb-2 flex items-center">
                  <input type="hidden" name="team_id" value={team.id} />
                  <input 
                    name="name" 
                    defaultValue={team.name}
                    className="text-2xl font-black text-white bg-transparent border-b-2 border-transparent hover:border-slate-600 focus:border-indigo-500 focus:bg-slate-900 outline-none w-full transition-all"
                    required
                    title="Modifica nome e premi Invio"
                  />
                  <button type="submit" className="hidden">Salva</button>
                </ActionForm>
                <ActionForm actionFunc={deleteTeam} successMessage="Squadra eliminata">
                  <input type="hidden" name="team_id" value={team.id} />
                  <button type="submit" className="text-red-400 hover:text-red-300 text-xs font-bold px-3 py-1 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors inline-block">
                    Elimina Squadra
                  </button>
                </ActionForm>
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
                    <li key={p.id} className="flex flex-col md:flex-row justify-between text-sm md:items-center bg-slate-800 p-2 rounded-lg border border-slate-700/50 gap-2">
                      <ActionForm actionFunc={updatePlayer} successMessage="Giocatore aggiornato" className="flex-1 flex gap-2">
                        <input type="hidden" name="player_id" value={p.id} />
                        <input 
                          name="name" 
                          defaultValue={p.name} 
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 outline-none w-full text-slate-200 focus:border-indigo-500"
                        />
                        <select 
                          name="category" 
                          defaultValue={p.category}
                          className="bg-slate-900 border border-slate-700 rounded px-1 py-1 text-xs text-indigo-300 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Altro/Amatoriale">+1</option>
                          <option value="Prima Categoria">+2</option>
                          <option value="Promozione">+3</option>
                          <option value="Eccellenza">+4</option>
                        </select>
                        <button type="submit" className="text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded" title="Salva modifiche">✓</button>
                      </ActionForm>
                      
                      <ActionForm actionFunc={deletePlayer} successMessage="Giocatore rimosso" className="flex items-center">
                        <input type="hidden" name="player_id" value={p.id} />
                        <button type="submit" className="text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors h-full flex items-center" title="Rimuovi giocatore">
                          ✕
                        </button>
                      </ActionForm>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 italic mb-6">Nessun giocatore registrato.</p>
              )}

              <ActionForm actionFunc={addPlayer} successMessage="Giocatore aggiunto!" className="mt-auto space-y-3">
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
              </ActionForm>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
