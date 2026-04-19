# GerryBet Task 4: Autenticazione (Login & Signup) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement login and signup functionality using Supabase and Next.js.

**Architecture:** Create a login page with a simple form and a callback route for auth redirect.

**Tech Stack:** Next.js (App Router), Supabase Auth, Tailwind CSS.

---

### Task 1: Creare la pagina di Login

**Files:**
- Create: `app/login/page.tsx`

- [ ] **Step 1: Create the login page component**

```tsx
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Controlla la tua email per confermare l\'iscrizione.')
    }
    setLoading(false)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
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
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="p-8 bg-white shadow-md rounded-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Login / Signup</h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className="flex flex-col space-y-2">
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Caricamento...' : 'Accedi'}
            </button>
            <button
              onClick={handleSignUp}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Registrati
            </button>
          </div>
        </form>
        {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/login/page.tsx
git commit -m "feat: create login page"
```

---

### Task 2: Creare la route per il callback

**Files:**
- Create: `app/auth/callback/route.ts`

- [ ] **Step 1: Create the auth callback route**

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
```

- [ ] **Step 2: Commit**

```bash
git add app/auth/callback/route.ts
git commit -m "feat: add auth callback route"
```

---

### Task 3: Aggiornare la home page per mostrare lo stato di login

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Update home page to show user status**

```tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">GerryBet</h1>
      <p className="mt-4 text-xl text-center">Benvenuti nel sito di scommesse del torneo estivo!</p>
      
      <div className="mt-8 flex flex-col items-center space-y-4">
        {user ? (
          <>
            <p className="text-lg">Ciao, <span className="font-semibold">{user.email}</span>!</p>
            <form action="/auth/signout" method="post">
              <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
                Esci
              </button>
            </form>
          </>
        ) : (
          <Link 
            href="/login" 
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
          >
            Accedi o Registrati
          </Link>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Add signout route**

**Files:**
- Create: `app/auth/signout/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    await supabase.auth.signOut()
  }

  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'), {
    status: 302,
  })
}
```

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx app/auth/signout/route.ts
git commit -m "feat: show user status on home page and add signout"
```
