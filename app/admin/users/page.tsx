import { createClient } from '@/lib/supabase/server'
import UserListClient from './components/UserListClient'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Gestione Utenti</h1>
      <p className="text-slate-400">Visualizza gli utenti registrati, cambia i ruoli e ricarica i GerryPoints.</p>

      <div className="mt-8">
        <UserListClient initialUsers={users || []} />
      </div>
    </div>
  )
}
