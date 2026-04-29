import { createClient } from '@/lib/supabase/server'
import { rechargePoints } from '@/app/actions/admin'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Gestione Utenti</h1>
      <p className="text-slate-400">Visualizza gli utenti registrati e ricarica i GerryPoints.</p>

      <div className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 overflow-hidden mt-8">
        <ul className="divide-y divide-slate-700">
          {users?.map((u) => (
            <li key={u.id} className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <p className="font-bold text-white text-lg">{u.username || 'Utente senza nome'}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold
                    ${u.role === 'admin' ? 'bg-indigo-900 text-indigo-300' : 'bg-slate-700 text-slate-300'}
                  `}>
                    {u.role}
                  </span>
                  <span className="text-slate-400 text-sm">{u.id}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase font-semibold">GP Attuali</p>
                  <p className="font-black text-2xl text-white">{u.gerry_points}</p>
                </div>
              </div>

              <form action={rechargePoints} className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-700">
                <input type="hidden" name="user_id" value={u.id} />
                <input 
                  type="number" 
                  name="amount" 
                  placeholder="Es. 50" 
                  className="w-24 px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
                  required 
                  min="1"
                />
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-colors">
                  Ricarica GP
                </button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
