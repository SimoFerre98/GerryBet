import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ToastProvider from '@/app/components/ToastProvider'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Verify Admin Role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-900/95 flex flex-col md:flex-row relative">
      <ToastProvider />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-950 -z-10"></div>
      
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-slate-900/50 backdrop-blur-xl border-r border-slate-700/50 text-slate-300 flex-shrink-0 flex flex-col md:h-screen sticky top-0 shadow-2xl">
        <div className="p-8 border-b border-slate-700/50">
          <Link href="/dashboard" className="text-2xl font-bold tracking-tight text-white flex items-center gap-3 transition-transform hover:scale-105">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 font-extrabold text-white flex items-center justify-center shadow-lg shadow-indigo-900/50">GB</span>
            Admin Panel
          </Link>
        </div>
        <nav className="p-6 flex-1 space-y-3 flex flex-col">
          <Link href="/admin" className="px-5 py-3 rounded-xl hover:bg-slate-800/80 hover:text-white hover:shadow-lg transition-all font-medium border border-transparent hover:border-slate-700/50">
            Dashboard
          </Link>
          <Link href="/admin/users" className="px-5 py-3 rounded-xl hover:bg-slate-800/80 hover:text-white hover:shadow-lg transition-all font-medium border border-transparent hover:border-slate-700/50">
            Gestione Utenti (GP)
          </Link>
          <Link href="/admin/teams" className="px-5 py-3 rounded-xl hover:bg-slate-800/80 hover:text-white hover:shadow-lg transition-all font-medium border border-transparent hover:border-slate-700/50">
            Gestione Squadre
          </Link>
          <Link href="/admin/matches" className="px-5 py-3 rounded-xl hover:bg-slate-800/80 hover:text-white hover:shadow-lg transition-all font-medium border border-transparent hover:border-slate-700/50">
            Gestione Partite
          </Link>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 text-slate-200">
        <div className="max-w-6xl mx-auto backdrop-blur-sm">
          {children}
        </div>
      </main>
    </div>
  )
}
