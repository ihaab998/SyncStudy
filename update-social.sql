-- update-social.sql

CREATE TABLE connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    requester_id UUID REFERENCES auth.users(id),
    receiver_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(requester_id, receiver_id)
);

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view connections" ON connections FOR SELECT USING (true);
CREATE POLICY "Users can insert connections" ON connections FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update connections" ON connections FOR UPDATE USING (auth.uid() = receiver_id OR auth.uid() = requester_id);
CREATE POLICY "Users can delete connections" ON connections FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

CREATE TABLE direct_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id),
    receiver_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their messages" ON direct_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can insert messages" ON direct_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
