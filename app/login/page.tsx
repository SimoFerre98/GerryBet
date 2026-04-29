'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Controlla la tua email per confermare l\'iscrizione.')
    }
    setLoading(false)
  }

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      setMessage(error.message)
    } else {
      router.push('/')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 bg-transparent">
      <div className="max-w-md w-full bg-white/40 backdrop-blur-xl border border-white/60 p-10 rounded-[3rem] shadow-2xl shadow-indigo-200/50">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-indigo-300 transform transition hover:scale-105">
            <span className="text-2xl font-black text-white drop-shadow-md">GB</span>
          </Link>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-indigo-600 tracking-tight">Accedi o Registrati</h2>
        </div>
        
        <form className="space-y-5" onSubmit={handleSignIn}>
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-indigo-900 mb-1 ml-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/60 border border-white/80 rounded-2xl px-4 py-3 text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all text-sm"
              required
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1 ml-1">
               <label htmlFor="password" className="block text-sm font-bold text-indigo-900">Password</label>
               <Link href="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                 Dimenticata?
               </Link>
            </div>
            
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/60 border border-white/80 rounded-2xl px-4 py-3 text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all text-sm"
              required
            />
          </div>
          <div className="pt-2 flex flex-col space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? 'Caricamento...' : 'Accedi'}
            </button>
            <button
              type="button"
              onClick={() => handleSignUp()}
              disabled={loading}
              className="w-full py-4 bg-white/80 backdrop-blur-sm border border-white text-indigo-700 font-bold rounded-2xl shadow-md hover:bg-white hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              Crea nuovo account
            </button>
          </div>
        </form>
        {message && (
          <div className={`mt-6 p-4 rounded-xl text-sm font-medium text-center border ${message.includes('Controlla') ? 'bg-green-50/50 border-green-200 text-green-700' : 'bg-red-50/50 border-red-200 text-red-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
