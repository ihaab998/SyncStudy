'use client'

import { useEffect } from 'react'

export default function PresenceTracker() {
  useEffect(() => {
    const ping = () => {
      fetch('/api/user/heartbeat', { method: 'POST' }).catch(console.error)
    }
    
    // Ping immediately on mount
    ping()
    
    // Ping every 2 minutes
    const interval = setInterval(ping, 2 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  return null
}
