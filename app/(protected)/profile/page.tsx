import { createClient } from '@/lib/supabase/server'
import { updateProfile, updatePassword } from '@/app/actions/profile'
import { ActionForm } from '@/app/admin/components/ActionForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300 tracking-tight drop-shadow-md">Il Tuo Profilo</h1>
          <p className="text-indigo-200/60 mt-1 font-medium">Gestisci le tue credenziali e le impostazioni account</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/10 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20 font-black text-white">
            {profile?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Saldo Attuale</p>
            <p className="text-2xl font-black text-white tracking-tight">{profile?.gerry_points} <span className="text-indigo-400">GC</span></p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Informazioni Profilo */}
        <section className="bg-slate-900/30 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">👤</span>
            <h2 className="text-xl font-bold text-white tracking-tight">Informazioni Personali</h2>
          </div>
          
          <ActionForm actionFunc={updateProfile} successMessage="Profilo aggiornato con successo!" className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest">Username</label>
              <input
                name="username"
                defaultValue={profile?.username || ''}
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner"
                placeholder="Inserisci username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest">Email (Non modificabile)</label>
              <input
                value={user?.email || ''}
                disabled
                className="w-full bg-slate-950/30 border border-white/5 rounded-2xl px-5 py-4 text-slate-500 cursor-not-allowed shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg"
            >
              Aggiorna Username
            </button>
          </ActionForm>
        </section>

        {/* Cambio Password */}
        <section className="bg-slate-900/30 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🔐</span>
            <h2 className="text-xl font-bold text-white tracking-tight">Sicurezza Account</h2>
          </div>

          <ActionForm actionFunc={updatePassword} successMessage="Password aggiornata correttamente!" className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest">Nuova Password</label>
              <input
                name="password"
                type="password"
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest">Conferma Password</label>
              <input
                name="confirmPassword"
                type="password"
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-[0_8px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_12px_30px_rgba(168,85,247,0.4)] transition-all duration-300 hover:scale-[1.02] active:scale-95"
            >
              Cambia Password
            </button>
          </ActionForm>
        </section>
      </div>

      <div className="bg-red-500/5 border border-red-500/20 rounded-[2rem] p-6 text-center">
        <p className="text-red-400/80 text-sm font-medium italic">
          Attenzione: Assicurati di conservare con cura le tue nuove credenziali.
        </p>
      </div>
    </div>
  )
}
