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
        <ActionForm actionFunc={createMatch} successMessage="Partita creata con successo!" className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <div className="w-full">
              <label className="text-xs text-slate-400 mb-1 block">Squadra di Casa</label>
              <select name="team_a_id" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" required>
                <option value="">Seleziona...</option>
                {teams?.map(t => <option key={t.id} value={t.id}>{t.name} (PR: {t.power_ranking})</option>)}
              </select>
            </div>
            <div className="w-full">
              <label className="text-xs text-slate-400 mb-1 block">Squadra in Trasferta</label>
              <select name="team_b_id" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" required>
                <option value="">Seleziona...</option>
                {teams?.map(t => <option key={t.id} value={t.id}>{t.name} (PR: {t.power_ranking})</option>)}
              </select>
            </div>
            <div className="w-full">
              <label className="text-xs text-slate-400 mb-1 block">Data e Ora Inizio</label>
              <input 
                type="datetime-local" 
                name="start_time" 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" 
                required 
              />
            </div>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
            <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-widest">Definisci Quote 1X2</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block font-bold uppercase">Quota 1 (Casa)</label>
                <input name="odd_1" type="number" step="0.01" placeholder="Es: 1.50" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none" required />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block font-bold uppercase">Quota X (Pareggio)</label>
                <input name="odd_x" type="number" step="0.01" placeholder="Es: 3.20" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none" required />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block font-bold uppercase">Quota 2 (Trasferta)</label>
                <input name="odd_2" type="number" step="0.01" placeholder="Es: 4.50" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none" required />
              </div>
            </div>
          </div>

          <button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black py-4 px-12 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95">
            Crea Partita con Quote
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
              <div className="mb-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Esito Finale (1X2)</h4>
                {match.odds && match.odds.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {['1', 'X', '2'].map(label => {
                      const odd = match.odds.find((o: any) => o.description === label);
                      return (
                        <div key={label} className="bg-slate-950/50 border border-slate-700/50 rounded-xl p-3 flex flex-col items-center">
                          <span className="text-[10px] text-slate-500 font-bold mb-1">{label}</span>
                          <span className="text-lg font-black text-white">{odd?.value || '-'}</span>
                          {match.status === 'open' && odd && (
                            <ActionForm actionFunc={resolveMatch} successMessage="Match risolto!" className="mt-3 w-full">
                              <input type="hidden" name="match_id" value={match.id} />
                              <input type="hidden" name="winning_odd_id" value={odd.id} />
                              <div className="flex flex-col gap-2">
                                <input 
                                  name="result" 
                                  placeholder="Risultato (2-1)" 
                                  className="text-[10px] w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white focus:outline-none focus:border-green-500"
                                  required
                                />
                                <button type="submit" className="w-full py-1.5 bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white rounded text-[10px] font-bold uppercase tracking-tight transition-all">Vincitrice</button>
                              </div>
                            </ActionForm>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">Nessuna quota inserita.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
