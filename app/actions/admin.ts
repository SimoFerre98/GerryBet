'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function rechargePoints(formData: FormData) {
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
  const amountStr = formData.get('amount') as string
  const amount = parseInt(amountStr, 10)

  if (!targetUserId || isNaN(amount) || amount <= 0) {
    throw new Error('Invalid input')
  }

  // Recharge points
  // First get current points
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('gerry_points')
    .eq('id', targetUserId)
    .single()

  if (!targetProfile) throw new Error('User not found')

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ gerry_points: targetProfile.gerry_points + amount })
    .eq('id', targetUserId)

  if (updateError) {
    throw new Error('Failed to recharge points')
  }

  revalidatePath('/admin/users')
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
