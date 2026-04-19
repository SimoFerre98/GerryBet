import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    await supabase.auth.signOut()
  }

  const requestUrl = new URL(request.url)

  return NextResponse.redirect(new URL('/', requestUrl.origin), {
    status: 302,
  })
}
