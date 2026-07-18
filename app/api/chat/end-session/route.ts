import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { roomId } = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || !roomId || !roomId.includes('-')) {
      return NextResponse.json({ success: false, error: 'Invalid request' })
    }

    const friendId = roomId.split('-').find((id: string) => id !== user.id)
    if (!friendId) {
      return NextResponse.json({ success: false, error: 'Friend not found' })
    }

    await supabase.from('direct_messages').insert({
      sender_id: user.id,
      receiver_id: friendId,
      content: '🔴 Video session ended'
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' })
  }
}
