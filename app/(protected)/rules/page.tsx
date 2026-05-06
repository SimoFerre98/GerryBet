import { createClient } from '@/lib/supabase/server'

export default async function RulesPage() {
  const supabase = await createClient()

  // Recupera i limiti dal database
  const { data: settings } = await supabase.from('system_settings').select('*')
  
  const maxBet = settings?.find(s => s.key === 'max_bet')?.value || 500
  const maxWin = settings?.find(s => s.key === 'max_win')?.value || 5000

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Regolamento e Limiti</h1>
        <p className="text-slate-400">Tutto quello che c'è da sapere su GerryBet, dai GerryCoin ai limiti di giocata.</p>
      </div>

      <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700 shadow-xl space-y-6">
        
        <section>
          <h2 className="text-xl font-bold text-indigo-400 mb-3 flex items-center gap-2">
            <span>🪙</span> Cosa sono i GerryCoin (GC)?
          </h2>
          <p className="text-slate-300 leading-relaxed text-sm">
            I GerryCoin sono la valuta virtuale del nostro bar! Non sono soldi reali e non possono essere acquistati direttamente. 
            Li ottieni mangiando e bevendo da noi (<strong>ogni euro speso al bar = 10 GerryCoin omaggio</strong>).
            <br/><br/>
            Puoi accumulare questi punti per ritirare fantastici premi gratuiti al bancone, oppure... puoi scommetterli per moltiplicarli!
          </p>
        </section>

        <hr className="border-slate-700/50" />

        <section>
          <h2 className="text-xl font-bold text-amber-400 mb-3 flex items-center gap-2">
            <span>⚖️</span> Limiti di Gioco Attuali
          </h2>
          <p className="text-slate-300 leading-relaxed text-sm mb-4">
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-1">Puntata Massima</span>
              <span className="text-2xl font-black text-white">{maxBet} GC</span>
              <p className="text-xs text-slate-400 mt-2">
                Non puoi puntare più di {maxBet} GerryCoin su un singolo biglietto/partita.
              </p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-1">Vincita Massima Netta</span>
              <span className="text-2xl font-black text-white">{maxWin} GC</span>
              <p className="text-xs text-slate-400 mt-2">
                Indipendentemente dalla quota, il sistema non pagherà mai più di {maxWin} GerryCoin per una singola giocata vincente.
              </p>
            </div>
          </div>
        </section>

        <hr className="border-slate-700/50" />

        <section>
          <h2 className="text-xl font-bold text-emerald-400 mb-3 flex items-center gap-2">
            <span>🎁</span> Riscatto dei Premi
          </h2>
          <p className="text-slate-300 leading-relaxed text-sm">
            Il listino dei premi sarà presto disponibile! Potrai usare i tuoi GerryCoin accumulati o vinti per richiedere drink, menù completi o sconti esclusivi al bancone.
          </p>
        </section>

      </div>
    </div>
  )
}
