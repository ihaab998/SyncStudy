-- Run this script in your Supabase SQL Editor for Phase 2

-- 1. Create sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id TEXT NOT NULL,
  type TEXT NOT NULL, -- e.g., 'matched', 'ai-companion', 'public'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- 2. Create session_notes table
CREATE TABLE IF NOT EXISTS public.session_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create session_summaries table
CREATE TABLE IF NOT EXISTS public.session_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  summary_json JSONB NOT NULL, -- To store structured data (topics, time, key_concepts, weak_areas)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Set up Row Level Security (RLS)
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_summaries ENABLE ROW LEVEL SECURITY;

-- Note: Simplified policies for MVP. Users can read/write their own data.
-- Since session_id tracks the room, multiple users in a room can have their own notes linked to the same session.

CREATE POLICY "Users can manage their own notes" 
ON public.session_notes FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own summaries" 
ON public.session_summaries FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert sessions" 
ON public.sessions FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can read sessions" 
ON public.sessions FOR SELECT 
USING (true);
