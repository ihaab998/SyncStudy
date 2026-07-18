CREATE TABLE public_rooms (
    id TEXT PRIMARY KEY,
    creator_id UUID REFERENCES auth.users(id),
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view public rooms" ON public_rooms FOR SELECT USING (true);
CREATE POLICY "Users can insert public rooms" ON public_rooms FOR INSERT WITH CHECK (auth.uid() = creator_id);
