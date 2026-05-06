'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateBalance(formData: FormData) {
  const supabase = await createClient()
  
  // Verify Admin
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Non autenticato')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new Error('Non autorizzato')
  }

  // Get form data
  const targetUserId = formData.get('user_id') as string
  const amountStr = formData.get('amount') as string
  const type = formData.get('type') as 'add' | 'remove'
  const amount = parseInt(amountStr, 10)

  if (!targetUserId || isNaN(amount) || amount <= 0) {
    throw new Error('Importo non valido')
  }

  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('gerry_points, recharge_count')
    .eq('id', targetUserId)
    .single()

  if (!targetProfile) throw new Error('Utente non trovato')

  let newBalance = targetProfile.gerry_points
  let newRechargeCount = targetProfile.recharge_count || 0
  let bonusApplied = false

  if (type === 'add') {
    newBalance += amount
    newRechargeCount += 1

    // Bonus: dopo la 3a ricarica, aggiungi 50 GC
    if (newRechargeCount === 3) {
      newBalance += 50
      bonusApplied = true
    }
  } else {
    if (targetProfile.gerry_points < amount) {
      throw new Error('L\'utente non ha abbastanza GerryCoin da detrarre')
    }
    newBalance -= amount
  }

  const updateData: any = { gerry_points: newBalance }
  if (type === 'add') {
    updateData.recharge_count = newRechargeCount
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', targetUserId)

  if (updateError) throw new Error('Errore durante l\'aggiornamento del saldo')

  // Log transaction
  await supabase.from('transactions').insert({
    user_id: targetUserId,
    amount: type === 'add' ? amount + (bonusApplied ? 50 : 0) : -amount,
    type: type === 'add' ? 'admin_recharge' : 'admin_deduct',
    description: type === 'add' ? (bonusApplied ? `Ricarica Admin + Bonus 50 GC` : `Ricarica Admin`) : `Rimozione Admin`
  })

  revalidatePath('/admin/users')
  revalidatePath('/admin')

  if (bonusApplied) {
    return { message: `🎁 Ricarica #${newRechargeCount} completata! Bonus di 50 GC sbloccato e accreditato!` }
  }

  if (type === 'add') {
    return { message: `Ricarica #${newRechargeCount} completata! (${3 - newRechargeCount > 0 ? `${3 - newRechargeCount} al bonus` : 'Bonus già sbloccato'})` }
  }
}

export async function updateUserRole(formData: FormData) {
  const supabase = await createClient()
  
  // Verify Admin
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new Error('Not authorized')
  }

  // Get form data
  const targetUserId = formData.get('user_id') as string
  const role = formData.get('role') as string

  if (!targetUserId || !['admin', 'user'].includes(role)) {
    throw new Error('Invalid input')
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', targetUserId)

  if (updateError) {
    throw new Error('Failed to update role')
  }

  revalidatePath('/admin/users')
}
