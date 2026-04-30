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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="bg-slate-900/30 backdrop-blur-2xl p-8 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Decorative inner glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300 tracking-tight drop-shadow-[0_0_20px_rgba(165,180,252,0.3)]">
            Ciao {profile?.username || user?.email},
          </h1>
          <p className="text-indigo-200/80 font-medium mt-1 text-lg">Bentornato su GerryBet.</p>
        </div>
        <div className="relative z-10 bg-black/20 backdrop-blur-3xl border border-white/10 rounded-3xl px-10 py-6 text-center min-w-[240px] shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] transform transition-transform hover:scale-105 duration-500 group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2 drop-shadow-md">Il tuo saldo</p>
          <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-400 drop-shadow-[0_0_25px_rgba(165,180,252,0.4)]">
            {profile?.gerry_points !== undefined ? profile.gerry_points : '0'} <span className="text-3xl text-indigo-400/50">GC</span>
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/matches" className="group relative bg-slate-900/30 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/10 hover:bg-slate-800/40 hover:border-indigo-400/30 transition-all duration-500 flex flex-col items-center text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-3xl flex items-center justify-center text-4xl font-bold mb-6 shadow-[0_0_30px_rgba(99,102,241,0.5)] group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 rotate-3 group-hover:rotate-12 border border-white/20 backdrop-blur-md">
            ⚽
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 drop-shadow-md">Palinsesto</h2>
          <p className="text-indigo-100/70 font-medium">Scopri le partite in programma, controlla le quote e piazza le tue scommesse in tempo reale.</p>
        </Link>
        
        <Link href="/history" className="group relative bg-slate-900/30 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/10 hover:bg-slate-800/40 hover:border-purple-400/30 transition-all duration-500 flex flex-col items-center text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-bl from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative w-24 h-24 bg-slate-800/80 backdrop-blur-md text-purple-400 rounded-3xl flex items-center justify-center text-4xl font-bold mb-6 shadow-[0_0_30px_rgba(168,85,247,0.3)] group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 -rotate-3 group-hover:-rotate-12 border border-purple-500/30">
            📜
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 drop-shadow-md">Le tue giocate</h2>
          <p className="text-indigo-100/70 font-medium">Controlla lo storico delle tue scommesse passate e tieni d'occhio lo stato di quelle ancora aperte.</p>
        </Link>
      </div>
    </div>
  )
}
