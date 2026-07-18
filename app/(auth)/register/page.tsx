import Link from 'next/link';
import AuthForm from '@/components/AuthForm';

export default function RegisterPage() {
  return (
    <main className="container flex-center" style={{ minHeight: '100vh' }}>
      <div className="card flex-center" style={{ maxWidth: '400px', width: '100%', flexDirection: 'column' }}>
        <h2 className="text-center">Create Account</h2>
        <p className="text-center" style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          Join Antigravity AI to find your study partner.
        </p>
        
        <AuthForm isRegister={true} />

        <p className="text-center" style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </main>
  );
}
