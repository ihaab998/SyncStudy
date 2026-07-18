'use client'

import { useState, useEffect } from 'react'

export default function PomodoroTimer() {
  const [focusDuration, setFocusDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<'study' | 'break'>('study')
  
  // Progress calculation
  const totalSeconds = mode === 'study' ? focusDuration * 60 : breakDuration * 60
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100

  // Handle mode switching manually
  const switchMode = (newMode: 'study' | 'break') => {
    setMode(newMode)
    setIsRunning(false)
    setTimeLeft(newMode === 'study' ? focusDuration * 60 : breakDuration * 60)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && isRunning) {
      // Timer finished!
      setIsRunning(false)
      
      // Play a soft notification sound
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
        audio.volume = 0.5
        audio.play().catch(() => {})
      } catch (e) {}

      // Log the study session if it was a focus block
      if (mode === 'study') {
        fetch('/api/stats/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ duration_minutes: focusDuration })
        }).catch(console.error)
      }
      
      // We purposefully DO NOT auto-switch modes anymore. 
      // It stays at 00:00 so the user knows they finished, until they manually switch.
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft, mode, focusDuration])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.4rem 0.8rem', 
      backgroundColor: mode === 'study' ? 'rgba(79, 138, 139, 0.1)' : 'rgba(39, 174, 96, 0.1)', 
      borderRadius: 'var(--radius-md)',
      border: mode === 'study' ? '1px solid rgba(79, 138, 139, 0.2)' : '1px solid rgba(39, 174, 96, 0.2)',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Progress Bar Background */}
      <div style={{ 
        position: 'absolute', left: 0, bottom: 0, height: '3px', 
        backgroundColor: mode === 'study' ? 'var(--color-primary)' : 'var(--color-success)', 
        width: `${progressPercent}%`, transition: 'width 1s linear' 
      }} />

      {/* Mode Switcher Tabs */}
      <div style={{ display: 'flex', backgroundColor: 'var(--color-surface)', borderRadius: '6px', padding: '0.2rem' }}>
        <button 
          onClick={() => switchMode('study')}
          style={{ padding: '0.2rem 0.6rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, backgroundColor: mode === 'study' ? 'var(--color-primary)' : 'transparent', color: mode === 'study' ? 'white' : 'var(--color-text-muted)', transition: '0.2s' }}
        >
          Focus
        </button>
        <button 
          onClick={() => switchMode('break')}
          style={{ padding: '0.2rem 0.6rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, backgroundColor: mode === 'break' ? 'var(--color-success)' : 'transparent', color: mode === 'break' ? 'white' : 'var(--color-text-muted)', transition: '0.2s' }}
        >
          Break
        </button>
      </div>
      
      {/* Duration Selector */}
      <select 
        value={mode === 'study' ? focusDuration : breakDuration}
        onChange={(e) => {
          const newDuration = parseInt(e.target.value)
          if (mode === 'study') {
            setFocusDuration(newDuration)
            if (!isRunning) setTimeLeft(newDuration * 60)
          } else {
            setBreakDuration(newDuration)
            if (!isRunning) setTimeLeft(newDuration * 60)
          }
        }}
        disabled={isRunning}
        style={{ 
          background: 'var(--color-surface)', 
          border: '1px solid var(--color-border)', 
          color: 'var(--color-text-main)', 
          borderRadius: '4px', 
          padding: '0.1rem 0.3rem',
          fontSize: '0.8rem',
          cursor: isRunning ? 'not-allowed' : 'pointer',
          outline: 'none'
        }}
      >
        {mode === 'study' ? (
          <>
            <option value={15}>15m</option>
            <option value={25}>25m</option>
            <option value={45}>45m</option>
            <option value={50}>50m</option>
            <option value={60}>60m</option>
          </>
        ) : (
          <>
            <option value={5}>5m</option>
            <option value={10}>10m</option>
            <option value={15}>15m</option>
            <option value={30}>30m</option>
          </>
        )}
      </select>

      {/* Timer Display */}
      <span style={{ fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-text-main)', minWidth: '4rem', textAlign: 'center' }}>
        {formatTime(timeLeft)}
      </span>
      
      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.3rem' }}>
        <button 
          onClick={() => {
             // If timer is 0, restart it when they click play
             if (!isRunning && timeLeft === 0) {
                setTimeLeft(mode === 'study' ? focusDuration * 60 : breakDuration * 60)
             }
             setIsRunning(!isRunning)
          }} 
          style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer', background: 'var(--color-surface)', color: 'var(--color-text-main)', boxShadow: 'var(--shadow-sm)' }}
        >
          {isRunning ? '⏸️' : '▶️'}
        </button>
        <button 
          onClick={() => { setTimeLeft(0); setIsRunning(true); }} // Start it so it hits 0 immediately and triggers the end effect
          style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer', background: 'var(--color-surface)', color: 'var(--color-text-main)', fontSize: '0.8rem', boxShadow: 'var(--shadow-sm)' }}
          title="Skip Timer (Test Mode)"
        >
          ⏭️
        </button>
      </div>
    </div>
  )
}
