import { NextResponse } from 'next/server'
import { RoomServiceClient } from 'livekit-server-sdk'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const apiKey = process.env.LIVEKIT_API_KEY || 'APIbKYz4rZNGcgC'
    const apiSecret = process.env.LIVEKIT_API_SECRET || '745utMg3Tcit8fdXMB5Vomz90H9qWIr5QrR1ZBgh1wZ'
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://nxtwave-93amqthp.livekit.cloud'

    const roomService = new RoomServiceClient(wsUrl, apiKey, apiSecret)
    
    // Fetch all active rooms from LiveKit
    const activeRooms = await roomService.listRooms()
    
    // Fetch metadata from Supabase
    const supabase = await createClient()
    const { data: publicRooms } = await supabase.from('public_rooms').select('*')

    // Merge LiveKit data with Supabase metadata
    const rooms = activeRooms.map(r => {
      const cleanName = r.name.replace('room_', '')
      const metadata = publicRooms?.find(pr => pr.id === cleanName)
      return {
        ...r,
        subject: metadata?.subject || 'General Study',
        topic: metadata?.topic || 'Open Session'
      }
    })
    
    return NextResponse.json({ rooms })
  } catch (error: any) {
    console.error('Failed to list rooms:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
