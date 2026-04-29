import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LiquidBackground from '@/app/components/LiquidBackground'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Get profile to check role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  console.log("SERVER DEBUG Layout - user.id:", user.id, " profile:", profile, " error:", profileError)

  return (
    <div className="min-h-screen flex flex-col relative text-slate-200 font-sans">
      <LiquidBackground />
      <header className="sticky top-0 z-50 bg-slate-900/30 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight text-white flex items-center gap-2 group">
            <span className="bg-gradient-to-br from-indigo-400 to-purple-400 text-transparent bg-clip-text font-black text-2xl group-hover:from-indigo-300 group-hover:to-purple-300 transition-all drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">GB</span>
          </Link>
          <nav className="flex space-x-6 items-center">
            <Link href="/matches" className="text-slate-300 hover:text-white font-medium transition-colors hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
              Palinsesto
            </Link>
            <Link href="/leaderboard" className="text-slate-300 hover:text-white font-medium transition-colors hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
              Classifica
            </Link>
            <Link href="/history" className="text-slate-300 hover:text-white font-medium transition-colors hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
              Storico
            </Link>
            {profile?.role === 'admin' && (
              <Link href="/admin" className="px-4 py-1.5 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:bg-indigo-500/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all backdrop-blur-md">
                Admin
              </Link>
            )}
          </nav>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
