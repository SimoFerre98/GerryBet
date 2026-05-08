'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function assertAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
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
}

export async function createTeam(formData: FormData) {
  const supabase = await createClient()
  await assertAdmin(supabase)

  const name = formData.get('name') as string
  const category = (formData.get('category') as string) || 'Generica' // mainly as label for the team
  if (!name) throw new Error('Missing fields')

  const { error } = await supabase
    .from('teams')
    .insert({ name, category })

  if (error) throw new Error('Failed to create team: ' + error.message)
  revalidatePath('/admin/teams')
}

export async function addPlayer(formData: FormData) {
  const supabase = await createClient()
  await assertAdmin(supabase)

  const team_id = formData.get('team_id') as string
  const name = formData.get('name') as string
  const category = formData.get('category') as string 
  
  if (!team_id || !name || !category) throw new Error('Missing fields')

  const { error } = await supabase
    .from('players')
    .insert({ team_id, name, category })

  if (error) throw new Error('Failed to add player: ' + error.message)
  revalidatePath('/admin/teams')
}

export async function updatePlayer(formData: FormData) {
  const supabase = await createClient()
  await assertAdmin(supabase)

  const player_id = formData.get('player_id') as string
  const name = formData.get('name') as string
  const category = formData.get('category') as string 
  
  if (!player_id || !name || !category) throw new Error('Missing fields')

  const { error } = await supabase
    .from('players')
    .update({ name, category })
    .eq('id', player_id)

  if (error) throw new Error('Failed to update player: ' + error.message)
  revalidatePath('/admin/teams')
}

export async function deletePlayer(formData: FormData) {
  const supabase = await createClient()
  await assertAdmin(supabase)

  const player_id = formData.get('player_id') as string
  if (!player_id) throw new Error('Missing player_id')

  const { error } = await supabase.from('players').delete().eq('id', player_id)
  if (error) throw new Error('Failed to delete player: ' + error.message)
  
  revalidatePath('/admin/teams')
}

export async function createMatch(formData: FormData) {
  const supabase = await createClient()
  await assertAdmin(supabase)

  const team_a_id = formData.get('team_a_id') as string
  const team_b_id = formData.get('team_b_id') as string
  const start_time_val = formData.get('start_time') as string
  
  const odd1 = parseFloat(formData.get('odd_1') as string)
  const oddX = parseFloat(formData.get('odd_x') as string)
  const odd2 = parseFloat(formData.get('odd_2') as string)

  if (!team_a_id || !team_b_id || !start_time_val || isNaN(odd1) || isNaN(oddX) || isNaN(odd2)) {
    throw new Error('Tutti i campi (incluso 1, X, 2) sono obbligatori')
  }

  if (team_a_id === team_b_id) {
    throw new Error('Una squadra non può giocare contro se stessa!')
  }

  // 1. Create Match
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .insert({ team_a_id, team_b_id, start_time: new Date(start_time_val).toISOString() })
    .select()
    .single()

  if (matchError) throw new Error('Failed to create match: ' + matchError.message)

  // 2. Create standard 1X2 odds
  const { error: oddsError } = await supabase
    .from('odds')
    .insert([
      { match_id: match.id, description: '1', value: odd1, type: '1x2' },
      { match_id: match.id, description: 'X', value: oddX, type: '1x2' },
      { match_id: match.id, description: '2', value: odd2, type: '1x2' }
    ])

  if (oddsError) {
    // Cleanup match if odds fail
    await supabase.from('matches').delete().eq('id', match.id)
    throw new Error('Failed to create odds: ' + oddsError.message)
  }

  revalidatePath('/admin/matches')
  revalidatePath('/matches')
}

export async function deleteTeam(formData: FormData) {
  const supabase = await createClient()
  await assertAdmin(supabase)
  
  const team_id = formData.get('team_id') as string
  if (!team_id) throw new Error('Missing team_id')

  const { error } = await supabase.from('teams').delete().eq('id', team_id)
  if (error) {
    if (error.code === '23503') {
      throw new Error('Impossibile eliminare la squadra: ci sono giocatori o partite associate. Rimuovi prima i dati collegati.')
    }
    throw new Error('Failed to delete team: ' + error.message)
  }
  
  revalidatePath('/admin/teams')
}

export async function updateTeam(formData: FormData) {
  const supabase = await createClient()
  await assertAdmin(supabase)
  
  const team_id = formData.get('team_id') as string
  const name = formData.get('name') as string
  if (!team_id || !name) throw new Error('Missing team data')

  const { error } = await supabase.from('teams').update({ name }).eq('id', team_id)
  if (error) throw new Error('Failed to update team: ' + error.message)
  
  revalidatePath('/admin/teams')
}

export async function deleteMatch(formData: FormData) {
  const supabase = await createClient()
  await assertAdmin(supabase)

  const match_id = formData.get('match_id') as string
  if (!match_id) throw new Error('Missing match_id')

  // ON DELETE CASCADE handles bets and odds automatically
  const { error } = await supabase.from('matches').delete().eq('id', match_id)
  if (error) throw new Error('Failed to delete match: ' + error.message)
  
  revalidatePath('/admin/matches')
}

export async function updateMatch(formData: FormData) {
  const supabase = await createClient()
  await assertAdmin(supabase)

  const match_id = formData.get('match_id') as string
  const start_time_val = formData.get('start_time') as string
  
  if (!match_id || !start_time_val) throw new Error('Dati partita mancanti')

  const { error } = await supabase
    .from('matches')
    .update({ start_time: new Date(start_time_val).toISOString() })
    .eq('id', match_id)

  if (error) throw new Error('Failed to update match: ' + error.message)
  
  revalidatePath('/admin/matches')
}

export async function addOdd(formData: FormData) {
  const supabase = await createClient()
  await assertAdmin(supabase)

  const match_id = formData.get('match_id') as string
  const description = formData.get('description') as string
  const valueStr = formData.get('value') as string
  const value = parseFloat(valueStr)

  if (!match_id || !description || isNaN(value)) throw new Error('Invalid odd data')

  const { error } = await supabase
    .from('odds')
    .insert({ match_id, type: 'custom', description, value })

  if (error) throw new Error('Failed to add odds: ' + error.message)
  revalidatePath('/admin/matches')
}

export async function resolveMatch(formData: FormData) {
  const supabase = await createClient()
  await assertAdmin(supabase)

  const match_id = formData.get('match_id') as string
  const winning_odd_id = formData.get('winning_odd_id') as string
  const result = formData.get('result') as string || 'Conclusa'

  if (!match_id || !winning_odd_id) throw new Error('Campi mancanti')

  const { error } = await supabase.rpc('resolve_match_bets', {
    p_match_id: match_id,
    p_winning_odd_id: winning_odd_id,
    p_result: result
  })

  if (error) throw new Error('Failed to resolve match: ' + error.message)
  
  revalidatePath('/admin/matches')
  revalidatePath('/history')
  revalidatePath('/dashboard')
  revalidatePath('/matches')
}

export async function resolveMatchByScore(formData: FormData) {
  const supabase = await createClient()
  await assertAdmin(supabase)

  const match_id = formData.get('match_id') as string
  const score_a = parseInt(formData.get('score_a') as string)
  const score_b = parseInt(formData.get('score_b') as string)

  if (!match_id || isNaN(score_a) || isNaN(score_b)) {
    throw new Error('Inserire un punteggio valido per entrambe le squadre')
  }

  // 1. Determina l'esito (1, X, o 2)
  let outcome = 'X'
  if (score_a > score_b) outcome = '1'
  else if (score_b > score_a) outcome = '2'

  const resultString = `${score_a}-${score_b}`

  // 2. Recupera l'ID della quota corrispondente a questo esito per il match
  const { data: odd, error: oddError } = await supabase
    .from('odds')
    .select('id')
    .eq('match_id', match_id)
    .eq('description', outcome)
    .single()

  if (oddError || !odd) {
    throw new Error('Impossibile trovare la quota corrispondente per l\'esito: ' + outcome)
  }

  // 3. Chiama l'RPC esistente per risolvere le scommesse
  const { error } = await supabase.rpc('resolve_match_bets', {
    p_match_id: match_id,
    p_winning_odd_id: odd.id,
    p_result: resultString
  })

  if (error) throw new Error('Errore durante la chiusura del match: ' + error.message)
  
  revalidatePath('/admin/matches')
  revalidatePath('/history')
  revalidatePath('/dashboard')
  revalidatePath('/matches')
}

export async function updateSystemSetting(formData: FormData) {
  const supabase = await createClient()
  await assertAdmin(supabase)

  const key = formData.get('key') as string
  const value = parseFloat(formData.get('value') as string)

  if (!key || isNaN(value)) throw new Error('Dati non validi')

  const { error } = await supabase
    .from('system_settings')
    .update({ value })
    .eq('key', key)

  if (error) throw new Error('Errore aggiornamento impostazione: ' + error.message)

  revalidatePath('/admin')
  revalidatePath('/rules')
}
