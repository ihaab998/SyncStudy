import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { duration_minutes } = await req.json()

    // 1. Log the session
    await supabase.from('study_sessions').insert({
      user_id: user.id,
      duration_minutes
    })

    // 2. Update progress stats
    const { data: stats } = await supabase
      .from('progress_stats')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const today = new Date().toISOString().split('T')[0]
    const hoursToAdd = duration_minutes / 60.0

    if (!stats) {
      // Create new stats row
      await supabase.from('progress_stats').insert({
        user_id: user.id,
        hours_studied: hoursToAdd,
        streak_count: 1,
        last_study_date: today
      })
    } else {
      // Update existing stats
      let newStreak = stats.streak_count || 0
      
      if (stats.last_study_date !== today) {
        const lastDate = new Date(stats.last_study_date)
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        
        if (lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
           newStreak += 1 // increment streak
        } else {
           newStreak = 1 // reset streak
        }
      }

      await supabase.from('progress_stats')
        .update({
          hours_studied: (parseFloat(stats.hours_studied) || 0) + hoursToAdd,
          streak_count: newStreak,
          last_study_date: today
        })
        .eq('user_id', user.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log stats' }, { status: 500 })
  }
}
