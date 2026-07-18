'use client'

import { useState } from 'react'
import { sendRequest } from '@/app/dashboard/match/actions'

export default function SendRequestButton({ receiverId }: { receiverId: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')

  const handleSend = async () => {
    setStatus('loading')
    const res = await sendRequest(receiverId)
    if (res.error) {
      if (res.error === 'Request already sent') {
         setStatus('sent')
      } else {
         setStatus('error')
      }
    } else {
      setStatus('sent')
    }
  }

  if (status === 'sent') {
    return <button disabled className="btn-secondary" style={{ width: '100%', textAlign: 'center', opacity: 0.7 }}>Request Sent ✅</button>
  }

  return (
    <button onClick={handleSend} disabled={status === 'loading'} className="btn-primary" style={{ width: '100%', textAlign: 'center' }}>
      {status === 'loading' ? 'Sending...' : 'Send Study Request'}
    </button>
  )
}
