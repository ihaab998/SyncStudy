import Link from 'next/link'
import { logout } from '@/app/auth/actions'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PresenceTracker from '@/components/PresenceTracker'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const isAdmin = user?.email === 'admin@syncstudy.com'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PresenceTracker />
      <header className="wrap-on-mobile padding-mobile-sm" style={{ padding: '1rem 2rem', backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>SyncStudy</h2>
        <nav className="wrap-on-mobile" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/dashboard" style={{ fontWeight: 500 }}>Dashboard</Link>
          <Link href="/dashboard/profile" style={{ fontWeight: 500 }}>Profile</Link>
          {isAdmin && (
            <Link href="/admin" className="hide-on-mobile" style={{ fontWeight: 500, color: 'var(--color-primary)' }}>Admin</Link>
          )}
          <form action={logout}>
            <button type="submit" className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>Logout</button>
          </form>
        </nav>
      </header>
      <main className="padding-mobile-sm" style={{ flex: 1, backgroundColor: 'var(--color-background)', padding: '2rem' }}>
        {children}
      </main>
    </div>
  )
}
