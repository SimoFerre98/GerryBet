import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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
    <div className="min-h-screen flex flex-col bg-transparent">
      <header className="sticky top-0 z-50 bg-white/40 backdrop-blur-xl border-b border-white/60 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight text-indigo-900 flex items-center gap-2">
            <span className="bg-gradient-to-br from-indigo-600 to-purple-600 text-transparent bg-clip-text font-black text-2xl">GB</span>
          </Link>
          <nav className="flex space-x-6 items-center">
            <Link href="/matches" className="text-slate-600 hover:text-indigo-700 font-medium transition-colors">
              Palinsesto
            </Link>
            <Link href="/leaderboard" className="text-slate-600 hover:text-indigo-700 font-medium transition-colors">
              Classifica
            </Link>
            <Link href="/history" className="text-slate-600 hover:text-indigo-700 font-medium transition-colors">
              Storico
            </Link>
            {profile?.role === 'admin' && (
              <Link href="/admin" className="px-3 py-1 bg-indigo-600/10 border border-indigo-600/20 text-indigo-700 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-600/20 transition-colors backdrop-blur-sm">
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
