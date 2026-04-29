import { createClient } from '@/lib/supabase/server'
import { createMatch, addOdd, resolveMatch, deleteMatch, updateMatch } from '@/app/actions/admin_entities'
import { ActionForm } from '@/app/admin/components/ActionForm'

export default async function AdminMatchesPage() {
  const supabase = await createClient()

  const { data: teams } = await supabase.from('teams').select('*').order('name')
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      team_a:teams!team_a_id(name, power_ranking),
      team_b:teams!team_b_id(name, power_ranking),
      odds (*)
    `)
    .order('start_time', { ascending: false })

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Gestione Partite</h1>
        <p className="text-slate-400">Crea scontri, definisci le quote e gestisci i risultati.</p>
      </div>

      {/* Creazione Match */}
      <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">Nuova Partita</h2>
        <ActionForm actionFunc={createMatch} successMessage="Partita creata con successo!" className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="text-xs text-slate-400 mb-1 block">Squadra di Casa</label>
            <select name="team_a_id" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" required>
              <option value="">Seleziona...</option>
              {teams?.map(t => <option key={t.id} value={t.id}>{t.name} (PR: {t.power_ranking})</option>)}
            </select>
          </div>
          <div className="flex items-center justify-center -mb-2 px-2 text-slate-500 font-bold hidden md:block">VS</div>
          <div className="flex-1 w-full">
            <label className="text-xs text-slate-400 mb-1 block">Squadra in Trasferta</label>
            <select name="team_b_id" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" required>
              <option value="">Seleziona...</option>
              {teams?.map(t => <option key={t.id} value={t.id}>{t.name} (PR: {t.power_ranking})</option>)}
            </select>
          </div>
          <div className="flex-1 w-full">
            <label className="text-xs text-slate-400 mb-1 block">Data e Ora Inizio</label>
            <input 
              type="datetime-local" 
              name="start_time" 
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" 
              required 
            />
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-colors w-full md:w-auto h-auto">
            Crea Partita
          </button>
        </ActionForm>
      </div>

      {/* Lista Partite Attive e Quote */}
      <h2 className="text-2xl font-bold text-white">Partite in Corso / Concluse</h2>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {matches?.map(match => (
          <div key={match.id} className={`rounded-2xl border flex flex-col overflow-hidden ${match.status === 'closed' ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-800/80 border-slate-700 shadow-lg'}`}>
            <div className="p-6 border-b border-slate-700/50 flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="text-center md:text-left flex-1">
                <span className={`text-xs font-bold px-2 py-1 rounded inline-block mb-2 uppercase tracking-wide
                  ${match.status === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}
                `}>{match.status === 'open' ? 'Aperta' : 'Chiusa'}</span>
                <div className="text-xl font-black text-white flex items-center gap-3">
                  <span>{match.team_a.name}</span>
                  <span className="text-slate-500 text-sm font-normal">vs</span>
                  <span>{match.team_b.name}</span>
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  Differenza Power Ranking: {Math.abs((match.team_a.power_ranking || 0) - (match.team_b.power_ranking || 0))}
                </div>
                {match.status === 'open' && (
                  <ActionForm actionFunc={updateMatch} successMessage="Data e ora aggiornate" className="flex gap-2 items-center mt-3 bg-slate-900/50 p-2 rounded-xl inline-flex border border-white/5">
                    <input type="hidden" name="match_id" value={match.id} />
                    <input 
                      type="datetime-local" 
                      name="start_time" 
                      defaultValue={new Date(match.start_time).toISOString().slice(0, 16)} 
                      className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" 
                      required 
                    />
                    <button type="submit" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-lg transition-colors">
                      Aggiorna
                    </button>
                  </ActionForm>
                )}
              </div>
              <ActionForm actionFunc={deleteMatch} successMessage="Partita eliminata">
                <input type="hidden" name="match_id" value={match.id} />
                <button type="submit" className="text-red-400 hover:text-red-300 text-xs font-bold px-3 py-1 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors">
                  Elimina
                </button>
              </ActionForm>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              {/* Quote Esistenti */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Quote Associate</h4>
                {match.odds && match.odds.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {match.odds.map((o: any) => (
                      <div key={o.id} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 flex items-center gap-3">
                        <span className="text-slate-300 font-medium text-sm">{o.description}</span>
                        <span className="text-indigo-400 font-bold whitespace-nowrap">{o.value}</span>
                        {match.status === 'open' && (
                          <ActionForm actionFunc={resolveMatch} successMessage="Partita chiusa!" className="ml-2 pl-2 border-l border-slate-700 flex items-center gap-2">
                            <input type="hidden" name="match_id" value={match.id} />
                            <input type="hidden" name="winning_odd_id" value={o.id} />
                            <input 
                              name="result" 
                              placeholder="Risultato (es: 2-1)" 
                              className="text-[10px] w-20 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white focus:outline-none focus:border-green-500"
                              required
                            />
                            <button type="submit" className="text-xs bg-green-600/20 text-green-400 hover:bg-green-500 hover:text-white px-2 py-1 rounded transition-colors" title="Imposta come vincente e chiudi match">Vincitrice</button>
                          </ActionForm>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">Nessuna quota inserita.</p>
                )}
              </div>

              {/* Form aggiunta quote (se aperta) */}
              {match.status === 'open' && (
                <ActionForm actionFunc={addOdd} successMessage="Quota aggiunta" className="mt-auto border-t border-slate-700 pt-4 flex gap-2">
                  <input type="hidden" name="match_id" value={match.id} />
                  <input name="description" placeholder="Es: 1" className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none" required />
                  <input name="value" type="number" step="0.01" placeholder="Quota (Es: 1.50)" className="w-1/3 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none" required />
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg">+</button>
                </ActionForm>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
