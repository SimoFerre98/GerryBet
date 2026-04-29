import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  return (
    <div className="space-y-6">
      <div className="bg-white/40 backdrop-blur-xl p-6 rounded-3xl shadow-xl shadow-indigo-100/50 border border-white/60 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-indigo-600 tracking-tight">Ciao, {profile?.username || user?.email}</h1>
          <p className="text-indigo-800/60 font-medium">Bentornato su GerryBet.</p>
          <div className="mt-2 p-2 bg-indigo-50/50 rounded-lg text-[10px] font-mono text-indigo-900/50">
            DEBUG: ID={user?.id} | Email={user?.email} | ProfileFound={profile ? 'YES' : 'NO'} | ProfileID={profile?.id} | Role={profile?.role}
            {profileError && <span> | Error: {JSON.stringify(profileError)}</span>}
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl px-8 py-5 text-center min-w-[200px] shadow-sm transform transition hover:scale-105 duration-300">
          <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Il tuo saldo</p>
          <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-700 to-purple-800">{profile?.gerry_points !== undefined ? profile.gerry_points : '0'} <span className="text-2xl text-indigo-900/50">GP</span></p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/matches" className="group bg-white/40 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white/60 hover:bg-white/60 hover:shadow-xl hover:border-indigo-300/50 transition-all duration-300 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mb-6 shadow-xl shadow-indigo-200 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300 rotate-3 group-hover:rotate-6">
            ⚽
          </div>
          <h2 className="text-2xl font-bold text-indigo-900 mb-3">Palinsesto</h2>
          <p className="text-indigo-900/60 font-medium">Scopri le partite in programma, controlla le quote e piazza le tue scommesse.</p>
        </Link>
        
        <Link href="/history" className="group bg-white/40 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white/60 hover:bg-white/60 hover:shadow-xl hover:border-purple-300/50 transition-all duration-300 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white/80 text-purple-600 rounded-2xl flex items-center justify-center text-3xl font-bold mb-6 shadow-xl shadow-purple-100 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300 -rotate-3 group-hover:-rotate-6 border border-white">
            📜
          </div>
          <h2 className="text-2xl font-bold text-indigo-900 mb-3">Le tue giocate</h2>
          <p className="text-indigo-900/60 font-medium">Controlla lo storico delle tue scommesse passate e lo stato di quelle aperte.</p>
        </Link>
      </div>
      
      <div className="mt-8 flex flex-col items-center gap-4">
        <p className="text-xs text-indigo-900/40 font-medium">Se non vedi i dati corretti, prova a rifare il login.</p>
        <form action="/auth/signout" method="post">
          <button className="px-6 py-3 text-red-500 hover:text-red-600 hover:bg-white/50 backdrop-blur-sm border border-transparent hover:border-red-100 rounded-xl text-sm font-bold transition-all duration-300">
            Disconnetti account
          </button>
        </form>
      </div>
    </div>
  )
}
