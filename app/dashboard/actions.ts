'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function acceptRequest(connectionId: string) {
  const supabase = await createClient()
  await supabase.from('connections').update({ status: 'accepted' }).eq('id', connectionId)
  revalidatePath('/dashboard')
}

export async function declineRequest(connectionId: string) {
  const supabase = await createClient()
  // Could delete the row, but keeping it as declined prevents spam requests
  await supabase.from('connections').update({ status: 'declined' }).eq('id', connectionId)
  revalidatePath('/dashboard')
}

export async function unmatchPerson(friendId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase.from('connections')
    .delete()
    .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .or(`requester_id.eq.${friendId},receiver_id.eq.${friendId}`)

  console.log('Unmatch error (if any):', error)

  revalidatePath('/dashboard/chat')
  revalidatePath('/dashboard')
}
