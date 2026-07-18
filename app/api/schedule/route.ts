import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { topic, start_time, end_time } = await req.json()

    await supabase.from('scheduled_sessions').insert({
      user_id: user.id,
      topic,
      start_time,
      end_time
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to schedule' }, { status: 500 })
  }
}
