'use client'

import { useState } from 'react'

export default function ReportButton({ roomId }: { roomId: string }) {
  const [showModal, setShowModal] = useState(false)
  const [reason, setReason] = useState('Inappropriate Behavior')
  const [details, setDetails] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle')

  const submitReport = async () => {
    setStatus('submitting')
    await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_id: roomId, reason, details })
    })
    setStatus('done')
    setTimeout(() => {
      setShowModal(false)
      setStatus('idle')
    }, 2000)
  }

  return (
    <>
      <button 
        onClick={() => setShowModal(true)} 
        style={{ padding: '0.4rem 0.8rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500, backdropFilter: 'blur(4px)' }}
      >
        <span>🚨</span> Report
      </button>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-md)', width: '90%', maxWidth: '400px', border: '1px solid var(--color-border)' }}>
            {status === 'done' ? (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: 'var(--color-success)', marginBottom: '1rem' }}>Report Submitted</h3>
                <p style={{ color: 'var(--color-text-muted)' }}>Thank you. Our moderation team will review this immediately.</p>
              </div>
            ) : (
              <>
                <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--color-text-main)' }}>Report User</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>If someone is violating the community guidelines, let us know.</p>
                
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Reason</label>
                <select className="input-field" value={reason} onChange={e => setReason(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }}>
                  <option>Inappropriate Behavior</option>
                  <option>Harassment or Abuse</option>
                  <option>Spam</option>
                  <option>Not a Student / Fake Account</option>
                </select>

                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Details (Optional)</label>
                <textarea className="input-field" rows={3} value={details} onChange={e => setDetails(e.target.value)} style={{ width: '100%', marginBottom: '1.5rem', resize: 'vertical' }} />

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn-primary" onClick={submitReport} disabled={status === 'submitting'} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }}>
                    {status === 'submitting' ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
