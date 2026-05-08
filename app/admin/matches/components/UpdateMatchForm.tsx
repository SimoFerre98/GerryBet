'use client'

import { useState } from 'react'
import { ActionForm } from '@/app/admin/components/ActionForm'
import { updateMatch } from '@/app/actions/admin_entities'

export default function UpdateMatchForm({ matchId, initialStartTime }: { matchId: string, initialStartTime: string }) {
  // initialStartTime is ISO string from DB (e.g. "2026-05-08T11:04:00+00:00")
  // We initialize the date object
  const [startDate, setStartDate] = useState<Date | null>(new Date(initialStartTime))

  return (
    <ActionForm actionFunc={updateMatch} successMessage="Data e ora aggiornate" className="flex gap-2 items-center mt-3 bg-slate-900/50 p-2 rounded-xl inline-flex border border-white/5">
      <input type="hidden" name="match_id" value={matchId} />
      <input type="hidden" name="start_time_iso" value={startDate ? startDate.toISOString() : ''} />
      <input 
        type="datetime-local" 
        name="start_time_local" 
        value={startDate ? new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} 
        onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
        className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" 
        required 
      />
      <button type="submit" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-lg transition-colors">
        Aggiorna
      </button>
    </ActionForm>
  )
}
