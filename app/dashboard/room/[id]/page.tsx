'use client'

import '@livekit/components-styles'
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PomodoroTimer from '@/components/PomodoroTimer'
import AITutor from '@/components/AITutor'
import SessionNotes from '@/components/SessionNotes'
import Whiteboard from '@/components/Whiteboard'
import ReportButton from '@/components/ReportButton'

export default function StudyRoomPage() {
  const params = useParams()
  const router = useRouter()
  const [token, setToken] = useState('')
  const id = params?.id

  useEffect(() => {
    (async () => {
      try {
        const username = `User_${Math.floor(Math.random() * 1000)}` 
        const roomName = `room_${id}`
        const resp = await fetch(`/api/livekit?room=${roomName}&username=${username}`)
        const data = await resp.json()
        setToken(data.token)
      } catch (e) {
        console.error(e)
      }
    })()
  }, [id])

  const [showSidebar, setShowSidebar] = useState(false)
  const [activeTab, setActiveTab] = useState<'tutor' | 'notes'>('tutor')
  const [activeWorkspace, setActiveWorkspace] = useState<'video' | 'whiteboard'>('video')

  if (!token) {
    return (
      <div className="container flex-center" style={{ minHeight: '80vh' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Connecting to Focus Room...</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      {/* Header */}
      <div className="glass-panel wrap-on-mobile padding-mobile-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', zIndex: 10 }}>
        <h3 style={{ margin: 0, color: 'var(--color-text-main)', fontSize: '1.2rem' }}>Study Room</h3>
        
        <div className="wrap-on-mobile" style={{ display: 'flex', gap: '2rem', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--color-surface)', padding: '0.3rem', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
            <button onClick={() => setActiveWorkspace('video')} style={{ padding: '0.4rem 1rem', borderRadius: '6px', border: 'none', backgroundColor: activeWorkspace === 'video' ? 'var(--color-primary)' : 'transparent', color: activeWorkspace === 'video' ? 'white' : 'var(--color-text-main)', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', fontSize: '0.9rem' }}>Video</button>
            <button onClick={() => setActiveWorkspace('whiteboard')} style={{ padding: '0.4rem 1rem', borderRadius: '6px', border: 'none', backgroundColor: activeWorkspace === 'whiteboard' ? 'var(--color-primary)' : 'transparent', color: activeWorkspace === 'whiteboard' ? 'white' : 'var(--color-text-main)', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', fontSize: '0.9rem' }}>Whiteboard</button>
          </div>
          <PomodoroTimer />
        </div>
        
        <div className="wrap-on-mobile" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <ReportButton roomId={id as string} />
          <button onClick={() => setShowSidebar(!showSidebar)} className="btn-primary" style={{ padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {showSidebar ? 'Close AI Tools' : '✨ Open AI Tools'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <style dangerouslySetInnerHTML={{ __html: `
        .lk-button[title="Chat"], .lk-chat-toggle { display: none !important; }
        @media (max-width: 768px) {
          .room-sidebar { width: 100% !important; border-left: none !important; border-top: 1px solid var(--color-border); }
          .room-sidebar.closed { width: 100% !important; height: 0px !important; border-top: none !important; }
        }
      `}} />
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://nxtwave-93amqthp.livekit.cloud'}
        connect={true}
        data-lk-theme="default"
        className="stack-on-mobile"
        onDisconnected={() => {
          if (id && (id as string).includes('-')) {
            fetch('/api/chat/end-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ roomId: id })
            }).catch(() => {})
          }
          router.push('/dashboard')
        }}
        style={{ flex: 1, display: 'flex', borderRadius: '0 0 var(--radius-md) var(--radius-md)', overflow: 'hidden' }}
      >
        
        {/* Left: Main Workspace */}
        <div style={{ flex: 1, backgroundColor: '#0f172a', transition: 'flex 0.3s', position: 'relative' }}>
          
          {/* Video Layer */}
          <div style={{ position: 'absolute', inset: 0, display: activeWorkspace === 'video' ? 'block' : 'none' }}>
            <VideoConference />
            <RoomAudioRenderer />
          </div>

          {/* Whiteboard Layer */}
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            visibility: activeWorkspace === 'whiteboard' ? 'visible' : 'hidden',
            opacity: activeWorkspace === 'whiteboard' ? 1 : 0,
            pointerEvents: activeWorkspace === 'whiteboard' ? 'auto' : 'none',
            transition: 'opacity 0.3s'
          }}>
            <Whiteboard />
          </div>

        </div>

        {/* Right: AI Tools Sidebar */}
        <div className={`room-sidebar ${!showSidebar ? 'closed' : ''}`} style={{ 
          width: showSidebar ? '380px' : '0px', 
          borderLeft: showSidebar ? '1px solid var(--color-border)' : 'none',
          display: 'flex', 
          flexDirection: 'column',
          transition: 'all 0.3s ease-in-out',
          backgroundColor: 'var(--color-surface)',
          overflow: 'hidden'
        }}>
          <div className="wrap-on-mobile" style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', minWidth: '100%' }}>
            <button 
              onClick={() => setActiveTab('tutor')} 
              style={{ flex: 1, padding: '1rem', backgroundColor: activeTab === 'tutor' ? 'transparent' : 'var(--color-bg-secondary)', border: 'none', borderBottom: activeTab === 'tutor' ? '2px solid var(--color-primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: 600, color: 'var(--color-text-main)' }}
            >
              AI Tutor Chat
            </button>
            <button 
              onClick={() => setActiveTab('notes')} 
              style={{ flex: 1, padding: '1rem', backgroundColor: activeTab === 'notes' ? 'transparent' : 'var(--color-bg-secondary)', border: 'none', borderBottom: activeTab === 'notes' ? '2px solid var(--color-primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: 600, color: 'var(--color-text-main)' }}
            >
              Session Notes
            </button>
          </div>
          <div style={{ flex: 1, overflow: 'hidden', minWidth: '380px' }}>
            {activeTab === 'tutor' ? <AITutor /> : <SessionNotes />}
          </div>
        </div>

      </LiveKitRoom>
    </div>
  )
}
