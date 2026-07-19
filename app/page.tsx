import Link from 'next/link';

export default function Home() {
  return (
    <main className="container flex-center" style={{ minHeight: '100vh', flexDirection: 'column' }}>
      <div className="card text-center" style={{ maxWidth: '600px', margin: '2rem 0' }}>
        <h1 style={{ color: 'var(--color-primary)' }}>Welcome to SyncStudy</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          Your ultimate collaborative study platform. Match with peers based on your goals, subjects, and learning style, and crush your next exam together!
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/login" className="btn-secondary">
            Log In
          </Link>
          <Link href="/register" className="btn-primary">
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
}
