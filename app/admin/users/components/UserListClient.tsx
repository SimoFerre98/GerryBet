'use client'

import { useState } from 'react'
import { updateUserRole, updateBalance } from '@/app/actions/admin'
import { ActionForm } from '@/app/admin/components/ActionForm'

type User = {
  id: string
  username: string | null
  email: string | null
  gerry_points: number
  role: string
}

export default function UserListClient({ initialUsers, currentUserId }: { initialUsers: User[], currentUserId: string }) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = initialUsers.filter((u) => 
    (u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="mb-6">
        <input 
          type="text" 
          placeholder="Cerca per username, email o ID..." 
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
                    <span className="text-slate-300 text-sm font-medium">{u.email}</span>
                    <span className="text-slate-500 text-[10px] truncate max-w-full">ID: {u.id}</span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
                  <div className="text-center md:text-right md:w-32 flex-shrink-0">
                    <p className="text-xs text-slate-400 uppercase font-semibold">GC Attuali</p>
                    <p className="font-black text-2xl text-white">{u.gerry_points}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto items-center">
                    {/* Role Selection */}
                    <ActionForm actionFunc={updateUserRole} className={`flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-700 ${isMe ? 'opacity-50 grayscale' : ''}`}>
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

                    {/* Balance Management */}
                    <div className="flex flex-col gap-3 bg-slate-900/50 p-3 rounded-2xl border border-white/5 w-full sm:w-auto">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold ml-1 text-center sm:text-left">Gestione Saldo (GC)</p>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <ActionForm actionFunc={updateBalance} successMessage="Saldo aggiornato!" className="flex items-center gap-2">
                          <input type="hidden" name="user_id" value={u.id} />
                          <input type="hidden" name="type" value="add" />
                          <input 
                            type="number" 
                            name="amount" 
                            placeholder="Aggiungi" 
                            className="w-20 px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-green-500 text-sm"
                            required 
                            min="1"
                          />
                          <button type="submit" className="w-10 h-10 bg-green-600/20 text-green-400 hover:bg-green-500 hover:text-white rounded-lg transition-all flex items-center justify-center font-bold text-xl" title="Aggiungi GC">
                            +
                          </button>
                        </ActionForm>

                        <div className="w-px h-8 bg-white/10 mx-1 hidden sm:block"></div>

                        <ActionForm actionFunc={updateBalance} successMessage="Saldo aggiornato!" className="flex items-center gap-2">
                          <input type="hidden" name="user_id" value={u.id} />
                          <input type="hidden" name="type" value="remove" />
                          <input 
                            type="number" 
                            name="amount" 
                            placeholder="Detrai" 
                            className="w-20 px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-red-500 text-sm"
                            required 
                            min="1"
                          />
                          <button type="submit" className="w-10 h-10 bg-red-600/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all flex items-center justify-center font-bold text-xl" title="Detrai GC">
                            -
                          </button>
                        </ActionForm>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
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
