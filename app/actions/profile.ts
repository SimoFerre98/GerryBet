'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Non autenticato')

  const username = formData.get('username') as string

  if (!username || username.length < 3) {
    throw new Error('Lo username deve essere di almeno 3 caratteri')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ username })
    .eq('id', user.id)

  if (error) throw new Error('Impossibile aggiornare lo username')

  revalidatePath('/profile')
  revalidatePath('/dashboard')
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Non autenticato')

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    throw new Error('Le password non coincidono')
  }

  if (password.length < 6) {
    throw new Error('La password deve essere di almeno 6 caratteri')
  }

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) throw new Error('Errore durante l\'aggiornamento della password: ' + error.message)
}
