import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ToastProvider from '@/app/components/ToastProvider'
import FloatingNav from '@/app/components/FloatingNav'

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
    <div className="min-h-screen bg-slate-900/95 relative pb-32">
      <ToastProvider />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-950 -z-10"></div>
      
      {/* Top Header for Admin (Simplified) */}
      <header className="p-6 md:p-8 flex items-center justify-between border-b border-white/5 backdrop-blur-md bg-slate-950/20 sticky top-0 z-50">
        <Link href="/admin" className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-3 transition-transform hover:scale-105">
          <span className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 font-extrabold text-white flex items-center justify-center shadow-lg shadow-indigo-900/50 text-sm md:text-base">GB</span>
          <span className="hidden sm:inline">Admin Panel</span>
          <span className="sm:hidden">Admin</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Sistema Attivo
        </div>
      </header>
      
      {/* Main Content */}
      <main className="p-6 md:p-10 text-slate-200 relative z-10">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Floating Navigation Pill */}
      <FloatingNav isAdmin={true} />
    </div>
  )
}
