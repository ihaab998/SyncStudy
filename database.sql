-- Run this entire script in your Supabase SQL Editor

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  college TEXT,
  branch TEXT,
  semester INTEGER,
  subjects TEXT[],
  exams TEXT[],
  goals TEXT,
  timings TEXT,
  learning_style TEXT,
  language TEXT,
  verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  student_id_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- 4. Create storage bucket for student IDs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('student_ids', 'student_ids', false)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage Policies for 'student_ids' (Restricts access to the owner)
CREATE POLICY "Users can upload their own student ID"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'student_ids' AND auth.uid()::text = (storage.foldername(name))[1] );

CREATE POLICY "Users can read their own student ID"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'student_ids' AND auth.uid()::text = (storage.foldername(name))[1] );

-- Function to handle new user signups and auto-create a profile row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run the function after a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
