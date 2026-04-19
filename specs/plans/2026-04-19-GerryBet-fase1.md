# GerryBet Implementation Plan - Fase 1: Fondamenta & Auth

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Inizializzare il progetto Next.js e configurare l'autenticazione con Supabase, includendo il database iniziale per gli utenti.

**Architecture:** Next.js (App Router) per il frontend e Supabase per backend/database. Utilizzeremo TypeScript e Tailwind CSS per lo stile.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, Supabase SDK.

---

### Task 1: Inizializzazione Next.js

**Files:**
- Create: `package.json`, `tailwind.config.ts`, `app/page.tsx`
- Modify: `.gitignore`

- [ ] **Step 1: Inizializzare Next.js nella root**
Esegui: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir false --import-alias "@/*" --use-npm --yes`

- [ ] **Step 2: Pulire il boilerplate iniziale**
Sostituisci il contenuto di `app/page.tsx` con un semplice titolo "GerryBet".
```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">GerryBet</h1>
      <p className="mt-4 text-xl">Benvenuti nel sito di scommesse del torneo estivo!</p>
    </main>
  );
}
```

- [ ] **Step 3: Verificare il funzionamento**
Esegui: `npm run dev` (controlla se il sito è visibile localmente).

- [ ] **Step 4: Commit**
```bash
git add .
git commit -m "feat: initialize Next.js project"
```

---

### Task 2: Configurazione Supabase Client

**Files:**
- Create: `.env.local`, `lib/supabase/client.ts`, `lib/supabase/server.ts`
- Modify: `package.json`

- [ ] **Step 1: Installare le dipendenze Supabase**
Esegui: `npm install @supabase/supabase-js @supabase/ssr`

- [ ] **Step 2: Creare il file di ambiente (Template)**
Crea `.env.local` con i placeholder per le chiavi Supabase.
```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- [ ] **Step 3: Implementare il client Supabase (Browser)**
Crea `lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

- [ ] **Step 4: Commit**
```bash
git add lib/ .env.local
git commit -m "feat: setup Supabase client utilities"
```

---

### Task 3: Database Schema & RLS (User Profiles)

**Files:**
- Create: `supabase/migrations/20260419_create_profiles.sql`

- [ ] **Step 1: Definire la tabella profiles**
Crea la migrazione SQL per la tabella `profiles` che estende `auth.users`.
```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  gerry_points integer default 100,
  role text default 'user' check (role in ('user', 'admin')),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Abilita RLS
alter table profiles enable row level security;

-- Policy: Gli utenti possono leggere il proprio profilo
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

-- Policy: Solo gli admin possono modificare i GP
create policy "Admins can update profiles" on profiles
  for update using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );
```

- [ ] **Step 2: Creare trigger per nuovi utenti**
Aggiungi una funzione che crea automaticamente un profilo quando un utente si registra.
```sql
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, gerry_points, role)
  values (new.id, new.raw_user_meta_data->>'username', 100, 'user');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

- [ ] **Step 3: Commit**
```bash
git add supabase/
git commit -m "db: add profiles table and auto-create trigger"
```

---

### Task 4: Autenticazione (Login & Signup)

**Files:**
- Create: `app/login/page.tsx`, `app/auth/callback/route.ts`

- [ ] **Step 1: Creare la pagina di Login**
Implementa un form semplice in `app/login/page.tsx` usando `supabase.auth.signInWithPassword`.

- [ ] **Step 2: Creare la route per il callback**
Crea `app/auth/callback/route.ts` per gestire il redirect dopo il login.

- [ ] **Step 3: Commit**
```bash
git add app/login/ app/auth/
git commit -m "feat: implement basic email/password auth"
```
