'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

type Message = {
  role: 'user' | 'assistant'
  content: string
  file?: {
    data: string // base64 data url
    mimeType: string
    name: string
  }
}

export default function AITutor() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I am your AI Study Tutor. Ask me to explain a concept, or attach an image/PDF (up to 4MB) for me to analyze!' }
  ])
  const [input, setInput] = useState('')
  const [selectedFile, setSelectedFile] = useState<{data: string, mimeType: string, name: string} | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 4 * 1024 * 1024) {
      alert("File is too large. Please select a file under 4MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setSelectedFile({
        data: event.target?.result as string,
        mimeType: file.type,
        name: file.name
      })
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && !selectedFile) || isLoading) return

    const userMsg: Message = { role: 'user', content: input || 'Analyze this file.', ...(selectedFile && { file: selectedFile }) }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setSelectedFile(null)
    setIsLoading(true)

    try {
      const resp = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] })
      })
      const data = await resp.json()
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. ' + (data.error || '') }])
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network error communicating with Tutor.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--color-surface)' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
            <div style={{
              backgroundColor: m.role === 'user' ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
              color: m.role === 'user' ? 'white' : 'var(--color-text-main)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              borderBottomRightRadius: m.role === 'user' ? '0' : 'var(--radius-md)',
              borderBottomLeftRadius: m.role === 'assistant' ? '0' : 'var(--radius-md)',
              lineHeight: 1.5,
              fontSize: '0.9rem',
              overflowX: 'auto'
            }}>
              {m.file && (
                <div style={{ marginBottom: '0.5rem', fontSize: '0.8rem', opacity: 0.8 }}>
                  📎 {m.file.name}
                </div>
              )}
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  p: ({node, ...props}) => <p style={{margin: '0.2rem 0'}} {...props} />,
                  pre: ({node, ...props}) => <pre style={{padding: '0.5rem', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '4px', overflowX: 'auto'}} {...props} />,
                  code: ({node, ...props}) => <code style={{backgroundColor: 'rgba(0,0,0,0.1)', padding: '0.1rem 0.2rem', borderRadius: '3px'}} {...props} />
                }}
              >
                {m.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ alignSelf: 'flex-start' }}>
            <div style={{ backgroundColor: 'var(--color-bg-secondary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {selectedFile && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--color-bg-secondary)', padding: '0.5rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📎 {selectedFile.name}</span>
            <button type="button" onClick={() => setSelectedFile(null)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*,application/pdf" 
            style={{ display: 'none' }} 
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()} 
            className="btn-secondary" 
            disabled={isLoading}
            style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Attach Image or PDF"
          >
            📎
          </button>
          <input
            type="text"
            className="input-field"
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            style={{ margin: 0, padding: '0.5rem 1rem' }}
          />
          <button type="submit" className="btn-primary" disabled={isLoading} style={{ padding: '0.5rem 1rem', width: 'auto' }}>
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
