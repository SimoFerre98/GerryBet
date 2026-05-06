'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Transaction = {
  id: string
  amount: number
  type: string
  description: string
  created_at: string
}

export default function UserTransactionsModal({ userId, username, onClose }: { userId: string, username: string, onClose: () => void }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchTransactions() {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)
      
      setTransactions(data || [])
      setLoading(false)
    }

    fetchTransactions()
  }, [userId, supabase])

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Storico Saldo</h2>
            <p className="text-sm text-slate-400 mt-1">Utente: <span className="text-indigo-400 font-bold">{username}</span></p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-full flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-center text-slate-500 py-8 italic">Nessun movimento registrato.</p>
          ) : (
            <div className="space-y-3">
              {transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-slate-950/50 hover:bg-slate-800 transition-colors">
                  <div>
                    <p className="text-white font-medium text-sm">{t.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-500 text-[10px] uppercase tracking-widest bg-slate-900 px-2 py-0.5 rounded">
                        {t.type}
                      </span>
                      <span className="text-slate-500 text-[10px] uppercase tracking-widest">
                        {new Date(t.created_at).toLocaleString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className={`font-black text-lg ${t.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {t.amount > 0 ? '+' : ''}{t.amount} <span className="text-xs font-bold text-slate-500">GC</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
