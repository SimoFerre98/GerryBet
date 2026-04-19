'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-50">
      <div className="p-8 bg-white shadow-md rounded-lg w-96 border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">GerryBet</h1>
        <h2 className="text-xl font-semibold mb-4 text-center text-gray-600">Login / Registrazione</h2>
        <form className="space-y-4" onSubmit={handleSignIn}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              required
            />
          </div>
          <div className="flex flex-col space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150 ease-in-out cursor-pointer"
            >
              {loading ? 'Caricamento...' : 'Accedi'}
            </button>
            <button
              type="button"
              onClick={() => handleSignUp()}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150 ease-in-out cursor-pointer"
            >
              Registrati
            </button>
          </div>
        </form>
        {message && <p className={`mt-4 text-center text-sm ${message.includes('Controlla') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
      </div>
    </div>
  )
}
