import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center p-6 bg-transparent">
      <div className="max-w-md w-full text-center space-y-8 bg-white/40 backdrop-blur-xl border border-white/60 p-10 rounded-[3rem] shadow-2xl shadow-indigo-200/50">
        <div className="mx-auto w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-indigo-300 transform transition hover:scale-105">
          <span className="text-5xl font-black text-white drop-shadow-md">GB</span>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-700 tracking-tight">GerryBet</h1>
          <p className="text-lg text-slate-700 font-medium">
            Divertiti scommettendo sulle partite del nostro torneo estivo.
          </p>
        </div>
        
        <div className="pt-6 space-y-4">
          <Link 
            href="/login" 
            className="block w-full px-8 py-4 bg-white/80 backdrop-blur-sm border border-white text-indigo-700 text-lg font-bold rounded-2xl shadow-lg hover:bg-white hover:shadow-xl hover:text-indigo-800 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0"
          >
            Inizia a Giocare
          </Link>
          <p className="text-sm text-slate-600 font-medium py-2 px-4 rounded-xl bg-indigo-50/50 inline-block border border-indigo-100/50">
            🎁 Ricevi 100 GC gratuiti all'iscrizione!
          </p>
        </div>
      </div>
    </main>
  );
}
