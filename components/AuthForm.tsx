'use client'

import { useState } from 'react'
import { loginWithPassword, registerWithPassword } from '@/app/auth/actions'

export default function AuthForm({ isRegister }: { isRegister?: boolean }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    
    if (isRegister) {
      const res = await registerWithPassword(formData)
      if (res?.error) {
        setError(res.error)
      } else if (res?.success) {
        setSuccess(true)
      }
    } else {
      const res = await loginWithPassword(formData)
      if (res?.error) {
        setError(res.error)
      }
    }
    
    setLoading(false)
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem' }}>
        <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-success)' }}>Account Created!</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          Please check your email to verify your account if required, or head to the login page.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {error && (
        <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-error)', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {isRegister && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
            <input type="text" name="name" className="input-field" placeholder="Jane Doe" required />
          </div>
        )}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>College Email</label>
          <input 
            type="email" 
            name="email" 
            className="input-field" 
            placeholder="you@college.edu" 
            required 
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Password</label>
          <input 
            type="password" 
            name="password" 
            className="input-field" 
            placeholder="••••••••" 
            required 
            minLength={6}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem', width: '100%' }}>
          {loading ? 'Processing...' : (isRegister ? 'Sign Up' : 'Log In')}
        </button>
      </form>
    </div>
  )
}
