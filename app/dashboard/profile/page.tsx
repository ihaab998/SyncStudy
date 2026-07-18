import { createClient } from '@/utils/supabase/server'
import ProfileForm from '@/components/ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <div className="card">
        <h2>Study Profile</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          Complete your profile to get matched with the best study partners.
        </p>
        <ProfileForm initialData={profile || {}} userId={user?.id} />
      </div>
    </div>
  )
}
