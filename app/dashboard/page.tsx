import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

import { acceptRequest, declineRequest } from './actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch profile to check verification status
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  // Fetch progress stats
  const { data: stats } = await supabase
    .from('progress_stats')
    .select('*')
    .eq('user_id', user?.id)
    .single()


  // Fetch Connections count
  const { count: connectionsCount } = await supabase
    .from('connections')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'accepted')
    .or(`requester_id.eq.${user?.id},receiver_id.eq.${user?.id}`)

  // Fetch pending requests
  const { data: rawRequests } = await supabase
    .from('connections')
    .select('*')
    .eq('receiver_id', user?.id)
    .eq('status', 'pending')
    
  let pendingRequests: any[] = []
  if (rawRequests && rawRequests.length > 0) {
    const requesterIds = rawRequests.map(r => r.requester_id)
    const { data: requesters } = await supabase.from('profiles').select('*').in('id', requesterIds)
    pendingRequests = rawRequests.map(r => ({
      ...r,
      requester: requesters?.find(p => p.id === r.requester_id)
    }))
  }

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>Welcome to SyncStudy</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Logged in as: {user?.email}</p>
        
        {/* Network Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="glass-panel hover-lift" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Network</h4>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-text-main)' }}>
                {connectionsCount || 0} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>Connections</span>
              </div>
            </div>
            <Link href="/dashboard/chat" className="btn-primary" style={{ padding: '0.6rem 1rem' }}>💬 Open Chat</Link>
          </div>

          <div className="glass-panel hover-lift" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ color: 'var(--color-text-muted)', margin: '0 0 1rem 0', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Inbox ({pendingRequests.length} Pending)</h4>
            {pendingRequests.length === 0 ? (
               <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.9rem' }}>No new study requests.</p>
            ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
                 {pendingRequests.map(req => (
                   <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-surface)', padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
                     <div>
                       <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{req.requester?.full_name}</div>
                       <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Wants to connect</div>
                     </div>
                     <div style={{ display: 'flex', gap: '0.4rem' }}>
                       <form action={async () => { 'use server'; await acceptRequest(req.id); }}>
                         <button type="submit" style={{ background: 'var(--color-success)', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Accept</button>
                       </form>
                       <form action={async () => { 'use server'; await declineRequest(req.id); }}>
                         <button type="submit" style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-main)', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Hide</button>
                       </form>
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </div>
        </div>

        {/* Analytics Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="glass-panel hover-lift" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Hours Studied</h4>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
              {stats?.hours_studied ? parseFloat(stats.hours_studied).toFixed(1) : '0.0'}
            </div>
          </div>
          <div className="glass-panel hover-lift" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Daily Streak</h4>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {stats?.streak_count || 0} <span>🔥</span>
            </div>
          </div>
        </div>


        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Verification Status</h3>
          {profile?.verification_status === 'verified' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
              <span style={{ color: 'var(--color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ✅ Verified Student
              </span>
              <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                <Link href="/dashboard/match" className="btn-primary" style={{ flex: 1, textAlign: 'center' }}>
                  Find Study Partner
                </Link>
                <Link href="/dashboard/public" className="btn-secondary" style={{ flex: 1, textAlign: 'center' }}>
                  Join Public Rooms
                </Link>
              </div>
            </div>
          ) : profile?.verification_status === 'banned' ? (
            <div style={{ color: 'var(--color-error)', fontWeight: 600 }}>
              🚫 Account Banned
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: '0.5rem 0 1rem 0', fontWeight: 400 }}>
                Your access to SyncStudy has been revoked due to a violation of our community guidelines.
              </p>
            </div>
          ) : profile?.verification_status === 'pending' && profile?.student_id_url ? (
            <span style={{ color: '#F39C12', fontWeight: 600 }}>
              ⏳ Pending Admin Approval
            </span>
          ) : (
            <div style={{ color: 'var(--color-error)', fontWeight: 500 }}>
              ❌ Not Verified
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: '0.5rem 0 1rem 0', fontWeight: 400 }}>
                You must complete your profile and upload your Student ID to start matching with study partners.
              </p>
              <Link href="/dashboard/profile" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                Complete Profile
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
