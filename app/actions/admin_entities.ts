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

export async function createMatch(formData: FormData) {
  const supabase = await createClient()
  await assertAdmin(supabase)

  const team_a_id = formData.get('team_a_id') as string
  const team_b_id = formData.get('team_b_id') as string
  const start_time = formData.get('start_time') as string

  if (!team_a_id || !team_b_id || !start_time || team_a_id === team_b_id) {
    throw new Error('Invalid match data')
  }

  const { data, error } = await supabase
    .from('matches')
    .insert({ team_a_id, team_b_id, start_time: new Date(start_time).toISOString() })
    .select()

  if (error) throw new Error('Failed to create match: ' + error.message)
  revalidatePath('/admin/matches')
  return data?.[0]
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

  if (!match_id || !winning_odd_id) throw new Error('Missing fields')

  const { error } = await supabase.rpc('resolve_match_bets', {
    p_match_id: match_id,
    p_winning_odd_id: winning_odd_id
  })

  if (error) throw new Error('Failed to resolve match: ' + error.message)
  
  revalidatePath('/admin/matches')
  revalidatePath('/history')
  revalidatePath('/dashboard')
}
