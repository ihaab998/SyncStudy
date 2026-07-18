import { findMatch } from './actions'
import Link from 'next/link'
import SendRequestButton from '@/components/SendRequestButton'

export default async function MatchPage() {
  const result = await findMatch()

  if (result.error) {
    return (
      <div className="container">
        <div className="card text-center">
          <h2 style={{ color: 'var(--color-error)' }}>Cannot Match</h2>
          <p>{result.error}</p>
          <Link href="/dashboard" className="btn-primary" style={{ marginTop: '1rem' }}>Go Back</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container flex-center" style={{ minHeight: '60vh', padding: '2rem 0' }}>
      <div className="card" style={{ maxWidth: '600px', width: '100%' }}>
        {result.isFallback ? (
          <div className="text-center">
            <h2>AI Study Companion</h2>
            <p style={{ color: 'var(--color-text-muted)', margin: '1rem 0' }}>
              No human partners are currently available that match your criteria. 
              Your AI companion is ready to help you stay focused!
            </p>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤖</div>
            <Link href="/dashboard/room/ai-companion" className="btn-primary" style={{ display: 'inline-block', width: '100%' }}>
              Start AI Session
            </Link>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Your Top Matches</h2>
              {result.usedAI ? (
                <span style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                  Powered by AI 🧠
                </span>
              ) : (
                <span style={{ backgroundColor: '#F39C12', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                  Advanced Heuristic (API Limit) ⚙️
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {result.matches.map((matchData: any, idx: number) => (
                <div key={matchData.profile.id} style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', position: 'relative', overflow: 'hidden' }}>
                  {idx === 0 && (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: 'var(--color-success)' }} />
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.2rem 0' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{matchData.profile.full_name}</h3>
                        {matchData.isOnline ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600, backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
                            Online
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, backgroundColor: 'var(--color-bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-text-muted)' }} />
                            Offline
                          </span>
                        )}
                      </div>
                      <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.9rem' }}>{matchData.profile.college} - {matchData.profile.branch}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: matchData.score > 70 ? 'var(--color-success)' : 'var(--color-primary)' }}>
                        {matchData.score}%
                      </span>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Match</span>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem', backgroundColor: 'var(--color-bg-secondary)', padding: '0.8rem', borderRadius: '4px' }}>
                    <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>AI Reasoning:</h4>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--color-text-main)', fontSize: '0.95rem' }}>
                      {matchData.reasons.map((r: string, i: number) => (
                        <li key={i} style={{ marginBottom: '0.2rem' }}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  <SendRequestButton receiverId={matchData.profile.id} />
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
               <Link href="/dashboard" className="btn-secondary">
                 Cancel & Go Back
               </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
