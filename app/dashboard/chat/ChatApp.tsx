'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

import { unmatchPerson } from '../actions'

export default function ChatApp({ currentUser, initialFriends }: { currentUser: any, initialFriends: any[] }) {
  const [activeFriend, setActiveFriend] = useState<any>(initialFriends[0] || null)
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const fetchMessages = async (friendId: string) => {
    const res = await fetch(`/api/chat/messages?friendId=${friendId}`)
    const data = await res.json()
    if (data.messages) {
      setMessages(data.messages)
    }
  }

  useEffect(() => {
    if (activeFriend) {
      fetchMessages(activeFriend.id)
      const interval = setInterval(() => {
        fetchMessages(activeFriend.id)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [activeFriend])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !activeFriend) return

    const tempMsg = { id: Math.random(), sender_id: currentUser.id, receiver_id: activeFriend.id, content: input, created_at: new Date().toISOString() }
    setMessages(prev => [...prev, tempMsg])
    setInput('')

    await fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId: activeFriend.id, content: tempMsg.content })
    })
    fetchMessages(activeFriend.id)
  }

  const getRoomId = () => {
    if (!activeFriend) return ''
    return [currentUser.id, activeFriend.id].sort().join('-')
  }

  const handleStartCall = async () => {
    if (!activeFriend) return
    const roomId = getRoomId()
    const inviteContent = `🎥 I just started a video session! Join me in room: ${roomId}`
    
    // Optimistically add message
    const tempMsg = { id: Math.random(), sender_id: currentUser.id, receiver_id: activeFriend.id, content: inviteContent, created_at: new Date().toISOString() }
    setMessages(prev => [...prev, tempMsg])

    // Send to database (fire and forget)
    fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId: activeFriend.id, content: inviteContent })
    })

    // Redirect user to the room
    window.location.href = `/dashboard/room/${roomId}`
  }

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .chat-sidebar { width: 300px; flex-shrink: 0; }
        @media (max-width: 768px) {
          .chat-sidebar { width: 100%; }
          .mobile-hidden { display: none !important; }
        }
      `}} />
      
      {/* Sidebar */}
      <div className={`chat-sidebar ${isMobileChatOpen ? 'mobile-hidden' : ''}`} style={{ borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', fontWeight: 600 }}>
          Your Connections
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {initialFriends.map(friend => {
            const isOnline = friend.last_seen && (new Date().getTime() - new Date(friend.last_seen).getTime() < 5 * 60 * 1000)
            return (
              <div 
                key={friend.id} 
                onClick={() => {
                  setActiveFriend(friend)
                  setIsMobileChatOpen(true)
                }}
                style={{ 
                  padding: '1rem', 
                  cursor: 'pointer', 
                  borderBottom: '1px solid var(--color-border)',
                  backgroundColor: activeFriend?.id === friend.id ? 'var(--color-bg-secondary)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: isOnline ? 'var(--color-success)' : 'var(--color-text-muted)' }} />
                <span style={{ fontWeight: 500 }}>{friend.full_name}</span>
              </div>
            )
          })}
          {initialFriends.length === 0 && (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No connections yet. Find a study partner!
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {activeFriend ? (
        <div className={`chat-area ${!isMobileChatOpen ? 'mobile-hidden' : ''}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
          <div className="wrap-on-mobile padding-mobile-sm" style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button 
                className="show-on-mobile" 
                onClick={() => setIsMobileChatOpen(false)}
                style={{ padding: '0.4rem', border: 'none', background: 'var(--color-surface)', borderRadius: '4px', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
              >
                ⬅️ Back
              </button>
              <h3 style={{ margin: 0 }}>{activeFriend.full_name}</h3>
              <button 
                onClick={async () => {
                  if (window.confirm('Are you sure you want to unmatch with this study partner? They will be removed from your connections forever.')) {
                    await unmatchPerson(activeFriend.id)
                    window.location.reload()
                  }
                }} 
                className="btn-secondary" 
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', color: 'var(--color-error)', borderColor: 'var(--color-error)', borderRadius: '4px' }}
              >
                Unmatch
              </button>
            </div>
            <button onClick={handleStartCall} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              🎥 Start Video Session
            </button>
          </div>
          
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-background)' }}>
            {messages.map((m, i) => {
              if (m.content === '🔴 Video session ended') return null
              
              const isMe = m.sender_id === currentUser.id
              const isInvite = m.content.startsWith('🎥 I just started a video session!')
              
              let sessionEnded = false
              if (isInvite) {
                 sessionEnded = messages.slice(i + 1).some(msg => msg.content === '🔴 Video session ended')
              }
              
              // Grouping logic (skip hidden messages)
              const prevMsg = i > 0 && messages[i-1].content !== '🔴 Video session ended' ? messages[i-1] : null
              const nextMsg = i < messages.length - 1 && messages[i+1].content !== '🔴 Video session ended' ? messages[i+1] : null
              const isFirstInGroup = !prevMsg || prevMsg.sender_id !== m.sender_id
              const isLastInGroup = !nextMsg || nextMsg.sender_id !== m.sender_id
              
              return (
                <div key={m.id} style={{ 
                  alignSelf: isMe ? 'flex-end' : 'flex-start', 
                  maxWidth: '70%',
                  marginTop: isFirstInGroup ? '1rem' : '0.2rem',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{ 
                    background: isMe ? 'linear-gradient(135deg, #007AFF, #5856D6)' : 'var(--color-surface)',
                    color: isMe ? 'white' : 'var(--color-text-main)',
                    border: isMe ? 'none' : '1px solid var(--color-border)',
                    padding: '0.75rem 1rem',
                    borderRadius: '18px',
                    borderBottomRightRadius: isMe && isLastInGroup ? '4px' : '18px',
                    borderBottomLeftRadius: !isMe && isLastInGroup ? '4px' : '18px',
                    borderTopRightRadius: isMe && !isFirstInGroup ? '4px' : '18px',
                    borderTopLeftRadius: !isMe && !isFirstInGroup ? '4px' : '18px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}>
                    {isInvite ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <span>🎥 I just started a video session!</span>
                        {sessionEnded ? (
                           <div style={{ padding: '0.4rem', textAlign: 'center', fontSize: '0.85rem', color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '4px', marginTop: '0.2rem' }}>
                             Session Ended
                           </div>
                        ) : (
                          <Link href={`/dashboard/room/${m.content.split('Join me in room: ')[1]}`} className={isMe ? "btn-secondary" : "btn-primary"} style={{ padding: '0.4rem', textAlign: 'center', fontSize: '0.85rem', textDecoration: 'none', marginTop: '0.2rem', color: 'white', borderColor: 'white' }}>
                            Join Call
                          </Link>
                        )}
                      </div>
                    ) : (
                      m.content
                    )}
                  </div>
                  {isLastInGroup && (
                    <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '0.3rem', textAlign: isMe ? 'right' : 'left', display: 'flex', alignItems: 'center', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: '4px' }}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isMe && <span style={{ color: '#007AFF' }}>✓✓</span>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type a message..." 
                className="input-field" 
                style={{ margin: 0, flex: 1 }}
              />
              <button type="submit" className="btn-primary">Send</button>
            </form>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
          Select a connection to start chatting
        </div>
      )}
    </div>
  )
}
