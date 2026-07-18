-- PHASE 4: ACCOUNTABILITY & GROWTH

-- 1. Progress Stats
CREATE TABLE progress_stats (
    user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
    hours_studied NUMERIC DEFAULT 0,
    streak_count INTEGER DEFAULT 0,
    last_study_date DATE
);

-- 2. Study Sessions Log
CREATE TABLE study_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    duration_minutes INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Scheduled Sessions
CREATE TABLE scheduled_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    topic TEXT NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending'
);

-- Enable RLS
ALTER TABLE progress_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats" ON progress_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON progress_stats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON progress_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own scheduled sessions" ON scheduled_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scheduled sessions" ON scheduled_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scheduled sessions" ON scheduled_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scheduled sessions" ON scheduled_sessions FOR DELETE USING (auth.uid() = user_id);
