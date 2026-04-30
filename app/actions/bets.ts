'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function placeBet(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Not authenticated')

  const matchId = formData.get('match_id') as string
  const oddId = formData.get('odd_id') as string
  const amountGpStr = formData.get('amount_gp') as string
  
  // Verify match has not started
  const { data: match } = await supabase
    .from('matches')
    .select('start_time, status')
    .eq('id', matchId)
    .single()

  if (!match || match.status !== 'open' || new Date(match.start_time) <= new Date()) {
    throw new Error('Le scommesse per questa partita sono chiuse')
  }

  const amountGp = parseInt(amountGpStr, 10)
  if (isNaN(amountGp) || amountGp <= 0) {
    throw new Error('Importo non valido')
  }

  // To do things safely, we should fetch profile, verify funds, insert bet, update profile using a single transaction.
  // However, since we don't have a pg function for atomic betting yet, we do it consecutively in this server action.
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('gerry_points')
    .eq('id', user.id)
    .single()

  if (!profile || profile.gerry_points < amountGp) {
    throw new Error('Insufficient funds')
  }

  // Insert Bet
  const { error: betError } = await supabase
    .from('bets')
    .insert({
      user_id: user.id,
      match_id: matchId,
      odd_id: oddId,
      amount_gp: amountGp,
      status: 'pending'
    })

  if (betError) {
    throw new Error('Failed to place bet')
  }

  // Update Profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ gerry_points: profile.gerry_points - amountGp })
    .eq('id', user.id)

  if (updateError) {
    // Note: if this fails the user got a free bet. An RPC function would be safer.
    console.error('Failed to deduct GP', updateError)
  }

  revalidatePath('/dashboard')
  revalidatePath('/matches')
  revalidatePath('/history')
}
