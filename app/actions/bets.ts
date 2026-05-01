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
  
  // 1. Verify match has not started
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

  // 2. To do things safely...
  const { data: oddData } = await supabase.from('odds').select('value').eq('id', oddId).single()
  const oddValue = oddData?.value || 1
  const potentialWin = Math.floor(amountGp * oddValue)
  const MAX_PAYOUT = 1000 // GC limit per single bet

  if (potentialWin > MAX_PAYOUT) {
    throw new Error(`Questa scommessa supera il massimale di vincita consentito (${MAX_PAYOUT} GC). Riduci l'importo.`)
  }

  // 4. Verify funds
  const { data: profile } = await supabase
    .from('profiles')
    .select('gerry_points')
    .eq('id', user.id)
    .single()

  if (!profile || profile.gerry_points < amountGp) {
    throw new Error('Fondi insufficienti')
  }

  // 5. Insert Bet
  const { error: betError } = await supabase
    .from('bets')
    .insert({
      user_id: user.id,
      match_id: matchId,
      odd_id: oddId,
      amount_gp: amountGp,
      status: 'pending'
    })

  if (betError) throw new Error('Errore durante il piazzamento della scommessa')

  // 6. Update Profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ gerry_points: profile.gerry_points - amountGp })
    .eq('id', user.id)

  if (updateError) console.error('Failed to deduct GP', updateError)

  // 7. ── DYNAMIC ODDS ADJUSTMENT (Auto-Balancing) ──
  // Fetch all current odds for this match
  const { data: currentOdds } = await supabase.from('odds').select('*').eq('match_id', matchId).eq('type', '1x2')
  
  // Fetch all current bets for this match to calculate weight
  const { data: matchBets } = await supabase.from('bets').select('amount_gp, odd_id').eq('match_id', matchId)
  
  if (currentOdds && matchBets && matchBets.length > 5) { // Start balancing after a few bets
    const totalVolume = matchBets.reduce((acc, b) => acc + b.amount_gp, 0)
    const overround = currentOdds.reduce((acc, o) => acc + (1 / o.value), 0)
    
    // Sensitivity factor: how fast the odds change
    const SENSITIVITY = 0.15 

    for (const odd of currentOdds) {
      const outcomeVolume = matchBets.filter(b => b.odd_id === odd.id).reduce((acc, b) => acc + b.amount_gp, 0)
      const currentWeight = outcomeVolume / totalVolume
      
      // Target weight is roughly 0.33 for a 3-way market
      // If current weight > 0.33, we increase probability (lower the odd)
      const bias = currentWeight - 0.33
      const currentProb = 1 / odd.value
      
      // New probability shifted by bias
      let newProb = currentProb + (bias * SENSITIVITY)
      
      // Boundaries
      newProb = Math.max(0.05, Math.min(0.85, newProb))
      
      const newValue = parseFloat((1 / newProb).toFixed(2))
      
      // Update odd in DB
      await supabase.from('odds').update({ value: newValue }).eq('id', odd.id)
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/matches')
  revalidatePath('/history')
}
