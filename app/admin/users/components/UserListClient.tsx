'use client'

import { useState } from 'react'
import { rechargePoints, updateUserRole } from '@/app/actions/admin'
import { ActionForm } from '@/app/admin/components/ActionForm'

type User = {
  id: string
  username: string | null
  gerry_points: number
  role: string
}

export default function UserListClient({ initialUsers, currentUserId }: { initialUsers: User[], currentUserId: string }) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = initialUsers.filter((u) => 
    (u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="mb-6">
        <input 
          type="text" 
          placeholder="Cerca per nome utente o ID..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 bg-slate-800/50 text-white rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
        />
      </div>

      <div className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 overflow-hidden">
        <ul className="divide-y divide-slate-700">
          {filteredUsers.map((u) => {
            const isMe = u.id === currentUserId;
            
            return (
              <li key={u.id} className="p-6 flex flex-col xl:flex-row items-center justify-between gap-6">
                <div className="flex-1 min-w-0 w-full text-center xl:text-left">
                  <div className="flex items-center justify-center xl:justify-start gap-2">
                    <p className="font-bold text-white text-lg truncate">{u.username || 'Utente senza nome'}</p>
                    {isMe && (
                      <span className="text-[10px] bg-white/10 text-white/50 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">Tu</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-center xl:justify-start gap-3 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold
                      ${u.role === 'admin' ? 'bg-indigo-900 text-indigo-300' : 'bg-slate-700 text-slate-300'}
                    `}>
                      {u.role}
                    </span>
                    <span className="text-slate-400 text-sm truncate max-w-full">{u.id}</span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
                  <div className="text-center md:text-right md:w-32 flex-shrink-0">
                    <p className="text-xs text-slate-400 uppercase font-semibold">GP Attuali</p>
                    <p className="font-black text-2xl text-white">{u.gerry_points}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <ActionForm actionFunc={updateUserRole} className={`flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-700 w-full sm:w-auto ${isMe ? 'opacity-50 grayscale' : ''}`}>
                      <input type="hidden" name="user_id" value={u.id} />
                      <select 
                        name="role" 
                        defaultValue={u.role}
                        disabled={isMe}
                        className="w-full sm:w-28 px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-indigo-500 text-sm disabled:cursor-not-allowed"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button 
                        type="submit" 
                        disabled={isMe}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded-lg transition-colors whitespace-nowrap disabled:cursor-not-allowed"
                      >
                        Applica
                      </button>
                    </ActionForm>

                  <ActionForm actionFunc={rechargePoints} className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-700 w-full sm:w-auto">
                    <input type="hidden" name="user_id" value={u.id} />
                    <input 
                      type="number" 
                      name="amount" 
                      placeholder="Es. 50" 
                      className="w-full sm:w-24 px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
                      required 
                      min="1"
                    />
                    <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-colors whitespace-nowrap">
                      Ricarica GP
                    </button>
                  </ActionForm>
                </div>
              </div>
            </li>
          ))}
          {filteredUsers.length === 0 && (
            <li className="p-8 text-center text-slate-400">
              Nessun utente trovato.
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
