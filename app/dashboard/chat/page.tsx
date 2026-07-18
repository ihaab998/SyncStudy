import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ChatApp from './ChatApp'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch accepted connections
  const { data: connections } = await supabase
    .from('connections')
    .select('*')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)

  let friends: any[] = []
  if (connections && connections.length > 0) {
    const friendIds = connections.map(c => c.requester_id === user.id ? c.receiver_id : c.requester_id)
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, last_seen').in('id', friendIds)
    friends = profiles || []
  }

  return (
    <div style={{ height: 'calc(100vh - 120px)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
      <ChatApp currentUser={{ id: user.id }} initialFriends={friends} />
    </div>
  )
}
