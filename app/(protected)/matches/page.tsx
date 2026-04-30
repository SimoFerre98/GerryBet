import { createClient } from '@/lib/supabase/server'
import MatchListClient from './components/MatchListClient'

export default async function MatchesPage() {
  const supabase = await createClient()

  const { data: matches, error } = await supabase
    .from('matches')
    .select(`
      *,
      team_a:teams!team_a_id(name),
      team_b:teams!team_b_id(name)
    `)
    .order('start_time', { ascending: false })

  if (error) {
    console.error('Error fetching matches:', error)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-center justify-between px-2 md:px-0">
        <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300 tracking-tight drop-shadow-md">Match Center</h1>
      </div>

      <MatchListClient initialMatches={matches || []} />
    </div>
  )
}
