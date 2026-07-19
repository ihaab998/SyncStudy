import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Check admin
  if (user.email !== 'admin@syncstudy.com') {
    redirect('/dashboard')
  }

  // Fetch pending profiles
  const { data: pendingProfiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('verification_status', 'pending')

  // Fetch reports
  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div className="card">
        <h2>Admin Dashboard</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Review pending student ID verifications below.</p>
        
        {pendingProfiles && pendingProfiles.length > 0 ? (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {pendingProfiles.map((profile) => (
              <div key={profile.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.2rem 0' }}>{profile.full_name}</h3>
                    <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.9rem' }}>User ID: {profile.id}</p>
                    <p style={{ color: 'var(--color-text-main)', margin: '0.5rem 0 0 0', fontWeight: 500 }}>University: {profile.university}</p>
                  </div>
                  <span style={{ backgroundColor: '#F39C12', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                    Pending
                  </span>
                </div>
                
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <img src={profile.student_id_url?.startsWith('http') ? profile.student_id_url : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/student_ids/${profile.student_id_url}`} alt="Student ID" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', backgroundColor: '#000' }} />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <form action={async () => {
                    'use server'
                    const supabase = await createClient()
                    await supabase.from('profiles').update({ verification_status: 'verified' }).eq('id', profile.id)
                    revalidatePath('/admin')
                  }} style={{ flex: 1 }}>
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>✅ Approve</button>
                  </form>
                  <form action={async () => {
                    'use server'
                    const supabase = await createClient()
                    await supabase.from('profiles').update({ verification_status: 'rejected' }).eq('id', profile.id)
                    revalidatePath('/admin')
                  }} style={{ flex: 1 }}>
                    <button type="submit" className="btn-secondary" style={{ width: '100%', borderColor: '#ef4444', color: '#ef4444' }}>❌ Reject</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '3rem' }}>🎉</span>
            <h3 style={{ color: 'var(--color-text-main)', marginTop: '1rem' }}>All Caught Up!</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>There are no pending verifications.</p>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2>Moderation Queue</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Review user reports from study rooms.</p>
        
        {reports && reports.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reports.map((report) => (
              <div key={report.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary)' }}>{report.reason}</h4>
                  {report.details && <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{report.details}</p>}
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    <strong>Room:</strong> {report.room_id} <br />
                    <strong>Reporter ID:</strong> {report.reporter_id}
                  </div>
                </div>
                <div>
                  {report.status === 'pending' ? (
                    <form action={async () => {
                      'use server'
                      const supabase = await createClient()
                      await supabase.from('reports').update({ status: 'resolved' }).eq('id', report.id)
                      revalidatePath('/admin')
                    }}>
                      <button type="submit" className="btn-primary" style={{ padding: '0.4rem 1rem' }}>Mark Resolved</button>
                    </form>
                  ) : (
                    <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>✅ Resolved</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-muted)' }}>No reports to review.</p>
        )}

        <h3 style={{ marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', marginBottom: '1rem' }}>Manual Ban</h3>
        <form action={async (formData) => {
          'use server'
          const userId = formData.get('userId') as string
          if (userId) {
            const supabase = await createClient()
            await supabase.from('profiles').update({ verification_status: 'banned' }).eq('id', userId)
            revalidatePath('/admin')
          }
        }} style={{ display: 'flex', gap: '1rem' }}>
          <input type="text" name="userId" placeholder="Enter User ID to ban..." className="input-field" style={{ flex: 1 }} required />
          <button type="submit" className="btn-primary" style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }}>Ban User</button>
        </form>
      </div>
    </div>
  )
}
