'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function PublicRoomsPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Create Room State
  const [showCreate, setShowCreate] = useState(false)
  const [subject, setSubject] = useState('')
  const [topic, setTopic] = useState('')
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/rooms')
      .then(res => res.json())
      .then(data => {
        if (data.rooms) {
          // Filter out rooms that are empty
          setRooms(data.rooms.filter((r: any) => r.numParticipants > 0))
        }
        setLoading(false)
      })
      .catch(e => {
        console.error(e)
        setLoading(false)
      })
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject || !topic) return
    setCreating(true)
    
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, topic })
      })
      const data = await res.json()
      if (data.roomId) {
        router.push(`/dashboard/room/${data.roomId}`)
      }
    } catch (error) {
      console.error(error)
      setCreating(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Live Public Rooms</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setShowCreate(!showCreate)} className="btn-primary" style={{ padding: '0.4rem 1rem' }}>
              {showCreate ? 'Cancel' : '+ Start Room'}
            </button>
            <Link href="/dashboard" className="btn-secondary" style={{ padding: '0.4rem 1rem' }}>
              Back
            </Link>
          </div>
        </div>

        {showCreate && (
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', marginBottom: '2rem', border: '1px solid var(--color-primary)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--color-primary)' }}>Start a New Public Room</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: 'var(--color-text-muted)' }}>Subject</label>
                <input type="text" placeholder="e.g. Mathematics" className="input-field" value={subject} onChange={e => setSubject(e.target.value)} required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', color: 'var(--color-text-muted)' }}>Topic</label>
                <input type="text" placeholder="e.g. Calculus II, Integration" className="input-field" value={topic} onChange={e => setTopic(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary" disabled={creating}>
                {creating ? 'Starting...' : 'Go Live!'}
              </button>
            </form>
          </div>
        )}
        
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          Join an active study session. You can hop into any public room to study alongside others!
        </p>

        {loading ? (
          <p>Scanning for active rooms...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <div key={room.name} style={{ padding: '1.5rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>{room.subject}</span>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-primary)' }}>
                        {room.topic}
                      </h3>
                    </div>
                    <span style={{ backgroundColor: 'var(--color-success)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                      Live
                    </span>
                  </div>
                  <p style={{ color: 'var(--color-text-main)', margin: 0 }}>
                    👥 {room.numParticipants} / {room.maxParticipants} Participants
                  </p>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
                    Started: {new Date(room.creationTime * 1000).toLocaleTimeString()}
                  </p>
                  <Link 
                    href={`/dashboard/room/${room.name.replace('room_', '')}`} 
                    className="btn-primary" 
                    style={{ textAlign: 'center', marginTop: 'auto' }}
                  >
                    Join Room
                  </Link>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤫</div>
                <h3 style={{ color: 'var(--color-text-main)' }}>It's quiet in here...</h3>
                <p style={{ color: 'var(--color-text-muted)' }}>There are no active public rooms at the moment.</p>
                <button onClick={() => setShowCreate(true)} className="btn-primary" style={{ marginTop: '1rem' }}>
                  Start the First Room
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
