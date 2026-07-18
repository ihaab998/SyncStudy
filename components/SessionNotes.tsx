'use client'

import { useState, useRef, useEffect } from 'react'
import { useDataChannel } from '@livekit/components-react'

export default function SessionNotes() {
  const [notes, setNotes] = useState('')
  const [summary, setSummary] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [isShared, setIsShared] = useState(false)
  const isSharedRef = useRef(isShared)

  useEffect(() => {
    isSharedRef.current = isShared
  }, [isShared])

  const { send } = useDataChannel('shared-notes', (msg) => {
    if (isSharedRef.current && msg.payload) {
      const decoded = new TextDecoder().decode(msg.payload)
      setNotes(decoded)
    }
  })

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setNotes(val)
    if (isShared) {
      const encoded = new TextEncoder().encode(val)
      send(encoded, { reliable: true })
    }
  }

  const toggleShared = () => {
    setIsShared(!isShared)
    // If turning on shared, immediately broadcast our current notes to sync the partner
    if (!isShared && notes.trim()) {
      const encoded = new TextEncoder().encode(notes)
      send(encoded, { reliable: true })
    }
  }

  const handleGenerateSummary = async () => {
    if (!notes.trim() || isGenerating) return
    setIsGenerating(true)
    setError('')
    
    try {
      const resp = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })
      const data = await resp.json()
      
      if (data.summary && !data.error) {
        setSummary(data.summary)
      } else {
        setError(data.error || 'Failed to generate summary.')
      }
    } catch (e) {
      setError('Network error.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--color-surface)', padding: '1rem', gap: '1rem' }}>
      
      {!summary ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h4 style={{ margin: 0, color: 'var(--color-text-main)' }}>Notes</h4>
              <button 
                onClick={toggleShared} 
                style={{ 
                  padding: '0.2rem 0.5rem', 
                  fontSize: '0.7rem', 
                  borderRadius: '10px', 
                  border: 'none', 
                  backgroundColor: isShared ? 'var(--color-primary)' : 'var(--color-bg-secondary)', 
                  color: isShared ? 'white' : 'var(--color-text-muted)',
                  cursor: 'pointer' 
                }}
              >
                {isShared ? 'Shared' : 'Personal'}
              </button>
            </div>
            <button 
              className="btn-secondary" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', width: 'auto' }}
              onClick={handleGenerateSummary}
              disabled={isGenerating || !notes.trim()}
            >
              {isGenerating ? 'Summarizing...' : 'Summarize'}
            </button>
          </div>
          {error && <p style={{ color: 'red', fontSize: '0.8rem', margin: 0 }}>{error}</p>}
          <textarea
            className="input-field"
            style={{ flex: 1, resize: 'none', padding: '1rem', lineHeight: 1.5, fontFamily: 'monospace' }}
            placeholder="Jot down formulas, concepts, or questions during your session..."
            value={notes}
            onChange={handleNotesChange}
          />
        </>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, color: 'var(--color-text-main)' }}>AI Summary</h4>
            <button className="btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', width: 'auto' }} onClick={() => setSummary(null)}>
              Back to Notes
            </button>
          </div>
          
          <div style={{ backgroundColor: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <h5 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Revision Note</h5>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>{summary.revision_notes}</p>
          </div>

          <div>
            <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-main)' }}>Topics Covered</h5>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
              {(summary.topics || []).map((t: string, i: number) => <li key={i}>{t}</li>)}
            </ul>
          </div>

          <div>
            <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-main)' }}>Key Concepts</h5>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
              {(summary.key_concepts || []).map((c: string, i: number) => <li key={i}>{c}</li>)}
            </ul>
          </div>

          {summary.weak_areas && summary.weak_areas.length > 0 && (
            <div>
              <h5 style={{ margin: '0 0 0.5rem 0', color: '#f59e0b' }}>To Review</h5>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
                {summary.weak_areas.map((w: string, i: number) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
