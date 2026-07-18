import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const friendId = searchParams.get('friendId')
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !friendId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('direct_messages')
    .select('*')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true })

  return NextResponse.json({ messages: data || [] })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { receiverId, content } = await req.json()

  const { error } = await supabase
    .from('direct_messages')
    .insert({ sender_id: user.id, receiver_id: receiverId, content })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
