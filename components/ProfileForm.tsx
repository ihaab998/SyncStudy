'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function ProfileForm({ initialData, userId }: { initialData: any, userId?: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const formData = new FormData(e.currentTarget)
    const updates: any = {
      id: userId,
      full_name: formData.get('full_name'),
      college: formData.get('college'),
      branch: formData.get('branch'),
      semester: parseInt(formData.get('semester') as string),
      goals: formData.get('goals'),
      timings: formData.get('timings'),
      updated_at: new Date().toISOString(),
    }

    if (file && userId) {
      const fileExt = file.name.split('.').pop()
      const filePath = `${userId}/${Math.random()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('student_ids')
        .upload(filePath, file)

      if (uploadError) {
        setMessage(`Upload Error: ${uploadError.message}`)
        setLoading(false)
        return
      }
      const { data: publicUrlData } = supabase.storage.from('student_ids').getPublicUrl(filePath)
      updates.student_id_url = publicUrlData.publicUrl
      updates.verification_status = 'pending' 
    }

    const { error } = await supabase
      .from('profiles')
      .upsert(updates)

    if (error) {
      setMessage(`Error saving profile: ${error.message}`)
    } else {
      setMessage('Profile saved successfully! 🎉')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {message && (
        <div style={{ padding: '0.75rem', backgroundColor: message.includes('Error') ? 'var(--color-error)' : 'var(--color-success)', color: 'white', borderRadius: 'var(--radius-sm)' }}>
          {message}
        </div>
      )}

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
        <input type="text" name="full_name" defaultValue={initialData?.full_name} className="input-field" required />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>College / University</label>
          <input type="text" name="college" defaultValue={initialData?.college} className="input-field" required />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Branch / Major</label>
          <input type="text" name="branch" defaultValue={initialData?.branch} className="input-field" required />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Semester / Year</label>
        <input type="number" name="semester" defaultValue={initialData?.semester} className="input-field" required min={1} max={12} />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Study Goals</label>
        <textarea name="goals" defaultValue={initialData?.goals} className="input-field" rows={3} placeholder="What are you trying to achieve? (e.g. Pass finals, prepare for GRE)" required />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Preferred Timings</label>
        <input type="text" name="timings" defaultValue={initialData?.timings} className="input-field" placeholder="e.g. Evenings (7 PM - 10 PM)" required />
      </div>

      <div style={{ border: '1px dashed var(--color-border)', padding: '1.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-background)' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Student ID Verification</label>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
          Upload a photo of your college ID. If you already uploaded one, your status is: <strong>{initialData?.verification_status || 'Unverified'}</strong>. Uploading a new one resets your status to pending.
        </p>
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ width: '100%' }}
        />
      </div>

      <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
        {loading ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  )
}
