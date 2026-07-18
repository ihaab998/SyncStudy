'use server'

import { createClient } from '@/utils/supabase/server'
import { GoogleGenAI } from '@google/genai'

export async function findMatch() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not logged in' }

    // Fetch the current user's full profile
    const { data: myProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (!myProfile || !myProfile.college) return { error: 'Please complete your profile to find matches.' }

    // Fetch potential matches (everyone else who is verified, not banned)
    const { data: potentialMatches } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', user.id)
      .eq('verification_status', 'verified')
      .limit(10)

    if (!potentialMatches || potentialMatches.length === 0) {
      return { isFallback: true, matches: [] }
    }

    const prompt = `
      You are an expert AI Matchmaker for a student study platform.
      I will provide you with the current user's profile and a list of potential matches.
      Please score each match out of 100 based on how well they would study together. 
      Consider college, branch, semester, study timings, and subjects.
      
      Current User:
      ${JSON.stringify(myProfile)}

      Potential Matches:
      ${JSON.stringify(potentialMatches)}

      Return the result strictly as a JSON array of objects. Each object must have:
      - "id": the id of the match
      - "score": the integer score from 0 to 100
      - "reasons": an array of 2-3 short strings explaining why they match.

      Do not wrap the output in markdown codeblocks. Return ONLY the raw JSON array.
    `

    let aiResults = []
    let usedAI = false
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
      })
      const text = (response.text || "").replace(/```json/g, '').replace(/```/g, '').trim()
      aiResults = JSON.parse(text)
      usedAI = true
    } catch (e: any) {
      console.warn("Gemini API Error (likely quota) or parsing failed. Falling back to heuristic matching.", e.message)
      // fallback to advanced heuristic matching if AI rate limit hit
      const normalize = (s: string) => s?.toLowerCase().replace(/[^a-z0-9]/g, '') || ''
      
      aiResults = potentialMatches.map(p => {
        let score = 0
        let reasons: string[] = []

        // College Match (Partial/Substring)
        const myCol = normalize(myProfile.college)
        const theirCol = normalize(p.college)
        if (myCol && theirCol && (myCol.includes(theirCol) || theirCol.includes(myCol))) {
          score += 40
          reasons.push("Similar college/university")
        }

        // Branch Match (Partial)
        const myBranch = normalize(myProfile.branch)
        const theirBranch = normalize(p.branch)
        if (myBranch && theirBranch && (myBranch.includes(theirBranch) || theirBranch.includes(myBranch))) {
          score += 25
          reasons.push("Similar branch of study")
        }

        // Semester Match
        if (p.semester && myProfile.semester && p.semester === myProfile.semester) {
          score += 15
          reasons.push(`Both in Semester ${p.semester}`)
        }

        // Subjects Overlap
        const mySubs = (myProfile.subjects || []).map((s: string) => normalize(s))
        const theirSubs = (p.subjects || []).map((s: string) => normalize(s))
        const common = mySubs.filter((s: string) => theirSubs.includes(s))
        if (common.length > 0) {
          score += 20
          reasons.push("Shared study subjects")
        }

        // Timings
        if (p.timings && p.timings === myProfile.timings) {
          score += 10
          reasons.push("Similar study schedule")
        }

        // Default baseline
        if (score === 0) {
          score = 25
          reasons.push("Ready to study")
        } else if (score > 99) {
          score = 99
        }

        return { id: p.id, score, reasons }
      })
    }

    // Sort by score descending
    aiResults.sort((a: any, b: any) => b.score - a.score)

    // Map back to profiles
    const matches = aiResults.map((res: any) => {
      const profile = potentialMatches.find(p => p.id === res.id)
      if (!profile) return null

      // Calculate online status
      const lastSeen = profile.last_seen ? new Date(profile.last_seen) : new Date(0)
      const diffMs = new Date().getTime() - lastSeen.getTime()
      const isOnline = diffMs < 5 * 60 * 1000 // 5 minutes

      return {
        profile,
        roomId: [user.id, profile.id].sort().join('-'),
        score: res.score,
        reasons: res.reasons,
        isOnline
      }
    }).filter(Boolean)

    return {
      matches,
      isFallback: matches.length === 0,
      usedAI
    }
  } catch (err: any) {
    console.error("Match Engine Error", err)
    return { error: 'Failed to run matching engine.' }
  }
}

export async function sendRequest(receiverId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  const { error } = await supabase
    .from('connections')
    .insert({ requester_id: user.id, receiver_id: receiverId, status: 'pending' })

  if (error) {
    if (error.code === '23505') {
      return { error: 'Request already sent' }
    }
    return { error: error.message }
  }

  return { success: true }
}
