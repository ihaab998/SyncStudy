import Link from 'next/link'
import { logout } from '@/app/auth/actions'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== 'admin@syncstudy.com') {
    redirect('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-background)' }}>
      <header className="wrap-on-mobile padding-mobile-sm" style={{ padding: '1rem 2rem', backgroundColor: '#1E2A34', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <h2 style={{ margin: 0, color: '#5AB3B5' }}>Admin Portal</h2>
        <nav className="wrap-on-mobile" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/dashboard" style={{ fontWeight: 500, color: 'white' }}>Student View</Link>
          <form action={logout}>
            <button type="submit" className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', backgroundColor: '#ef4444', color: 'white', border: 'none' }}>Logout</button>
          </form>
        </nav>
      </header>
      <main className="padding-mobile-sm" style={{ flex: 1, padding: '2rem' }}>
        {children}
      </main>
    </div>
  )
}
