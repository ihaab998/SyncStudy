import Link from 'next/link';
import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  return (
    <main className="container flex-center" style={{ minHeight: '100vh' }}>
      <div className="card flex-center" style={{ maxWidth: '400px', width: '100%', flexDirection: 'column' }}>
        <h2 className="text-center">Welcome Back</h2>
        <p className="text-center" style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          Log in with your college email.
        </p>
        
        <AuthForm isRegister={false} />

        <p className="text-center" style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Don't have an account? <Link href="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </main>
  );
}
