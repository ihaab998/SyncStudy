import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { subject, topic } = await req.json()
    const roomId = crypto.randomUUID()

    await supabase.from('public_rooms').insert({
      id: roomId,
      creator_id: user.id,
      subject,
      topic
    })

    return NextResponse.json({ roomId })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  }
}
