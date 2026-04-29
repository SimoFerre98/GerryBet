import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LiquidBackground from '@/app/components/LiquidBackground'
import FloatingNav from '@/app/components/FloatingNav'

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
    <div className="min-h-screen flex flex-col relative text-slate-200 font-sans pb-24 md:pb-6">
      <LiquidBackground />
      
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 mt-4 md:mt-8">
        {children}
      </main>

      <FloatingNav isAdmin={profile?.role === 'admin'} />
    </div>
  )
}
