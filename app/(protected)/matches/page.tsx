import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function MatchesPage() {
  const supabase = await createClient()

  const { data: matches, error } = await supabase
    .from('matches')
    .select(`
      *,
      team_a:teams!team_a_id(name),
      team_b:teams!team_b_id(name)
    `)
    .eq('status', 'open')
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching matches:', error)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-indigo-600 tracking-tight">Palinsesto</h1>
      </div>

      <div className="grid gap-6">
        {matches && matches.length > 0 ? (
          matches.map((match) => (
            <Link 
              key={match.id} 
              href={`/matches/${match.id}`}
              className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 shadow-lg shadow-indigo-100/50 border border-white/60 hover:bg-white/60 hover:border-indigo-300/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-6 block group"
            >
              <div className="flex-1 text-center md:text-left">
                <p className="text-sm text-indigo-500 font-bold mb-2 uppercase tracking-widest">
                  {new Date(match.start_time).toLocaleString('it-IT', { 
                    weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                  })}
                </p>
                <div className="text-3xl font-black text-indigo-950 flex justify-center md:justify-start items-center gap-4 w-full">
                  <span className="flex-1 md:flex-initial text-right">{match.team_a.name}</span>
                  <span className="text-indigo-300 text-xl mx-2 font-bold bg-indigo-50/50 px-3 py-1 rounded-lg border border-indigo-100/50">VS</span>
                  <span className="flex-1 md:flex-initial text-left">{match.team_b.name}</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-wide text-sm whitespace-nowrap shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                Scommetti Ora
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-16 bg-white/30 backdrop-blur-md rounded-3xl border border-white/60 shadow-inner">
            <span className="text-5xl drop-shadow-md">🏟️</span>
            <h3 className="mt-6 text-2xl font-bold text-indigo-900">Nessuna partita disponibile</h3>
            <p className="text-indigo-800/60 mt-2 font-medium">Torna più tardi per scoprire il nuovo palinsesto.</p>
          </div>
        )}
      </div>
    </div>
  )
}
