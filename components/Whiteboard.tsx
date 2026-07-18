'use client'

import { useRef, useEffect, useState } from 'react'
import { useDataChannel } from '@livekit/components-react'

type Point = { x: number, y: number }
type Stroke = { points: Point[], color: string, width: number }

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#10b981')
  const [brushSize, setBrushSize] = useState(3)
  
  const currentStrokeRef = useRef<Point[]>([])
  
  const { send } = useDataChannel('whiteboard', (msg) => {
    if (msg.payload) {
      const decoded = new TextDecoder().decode(msg.payload)
      try {
        const stroke: Stroke = JSON.parse(decoded)
        
        if (stroke.color === 'clear') {
           const canvas = canvasRef.current
           const ctx = canvas?.getContext('2d')
           if (canvas && ctx) {
              ctx.fillStyle = '#1e293b'
              ctx.fillRect(0, 0, canvas.width, canvas.height)
           }
        } else {
           drawStroke(stroke)
        }
      } catch(e) {}
    }
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.lineWidth = 3
        
        ctx.fillStyle = '#1e293b'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    let clientX, clientY
    
    if ('touches' in e) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
    } else {
        clientX = e.clientX
        clientY = e.clientY
    }
    
    const x = (clientX - rect.left) * (canvas.width / rect.width)
    const y = (clientY - rect.top) * (canvas.height / rect.height)
    
    setIsDrawing(true)
    currentStrokeRef.current = [{ x, y }]
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    
    const rect = canvas.getBoundingClientRect()
    let clientX, clientY
    
    if ('touches' in e) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
    } else {
        clientX = e.clientX
        clientY = e.clientY
    }
    
    const x = (clientX - rect.left) * (canvas.width / rect.width)
    const y = (clientY - rect.top) * (canvas.height / rect.height)
    
    const lastPoint = currentStrokeRef.current[currentStrokeRef.current.length - 1]
    
    ctx.beginPath()
    ctx.moveTo(lastPoint.x, lastPoint.y)
    ctx.lineTo(x, y)
    ctx.lineWidth = brushSize
    ctx.strokeStyle = color
    ctx.stroke()
    
    currentStrokeRef.current.push({ x, y })
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    
    if (currentStrokeRef.current.length > 1) {
       const stroke: Stroke = { points: currentStrokeRef.current, color, width: brushSize }
       const encoded = new TextEncoder().encode(JSON.stringify(stroke))
       send(encoded, { reliable: true })
    }
    
    currentStrokeRef.current = []
  }
  
  const drawStroke = (stroke: Stroke) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || stroke.points.length < 2) return
    
    ctx.beginPath()
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
    for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
    }
    ctx.lineWidth = stroke.width || (stroke.color === '#1e293b' ? 25 : 3)
    ctx.strokeStyle = stroke.color
    ctx.stroke()
  }
  
  const clearCanvas = () => {
     const canvas = canvasRef.current
     const ctx = canvas?.getContext('2d')
     if (canvas && ctx) {
        ctx.fillStyle = '#1e293b'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        const stroke: Stroke = { points: [], color: 'clear', width: 0 }
        const encoded = new TextEncoder().encode(JSON.stringify(stroke))
        send(encoded, { reliable: true })
     }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div style={{ display: 'flex', gap: '0.8rem', padding: '0.8rem', backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', alignItems: 'center' }}>
        {['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#ffffff', '#1e293b'].map(c => (
           <button 
             key={c} 
             onClick={() => {
               setColor(c)
               setBrushSize(c === '#1e293b' ? 25 : 3)
             }}
             title={c === '#1e293b' ? 'Eraser' : 'Color'}
             style={{ 
               width: '28px', height: '28px', borderRadius: '50%', 
               backgroundColor: c === '#1e293b' ? '#334155' : c, 
               border: color === c ? '2px solid white' : '2px solid transparent',
               cursor: 'pointer',
               display: 'flex', justifyContent: 'center', alignItems: 'center',
               fontSize: '1rem'
             }} 
           >
             {c === '#1e293b' ? '🧽' : ''}
           </button>
        ))}
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem', borderLeft: '1px solid var(--color-border)', paddingLeft: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Size</span>
          <input 
            type="range" 
            min="1" 
            max="100" 
            value={brushSize} 
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            style={{ width: '80px', cursor: 'ew-resize' }}
          />
        </div>
        
        <div style={{ flex: 1 }} />
        <button onClick={clearCanvas} style={{ background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem' }}>
          Clear Board
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{ flex: 1, cursor: 'crosshair', touchAction: 'none' }}
      />
    </div>
  )
}
