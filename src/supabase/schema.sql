-- =============================================================================
-- FOCUS EDITION: Complete Supabase Database Schema with Row-Level Security (RLS)
-- =============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_initials TEXT DEFAULT 'FE',
  allow_ai_processing BOOLEAN DEFAULT FALSE, -- Privacy: strictly opt-in
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'trial', 'canceled', 'none')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile only"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile only"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


-- 3. Editions Table
CREATE TABLE IF NOT EXISTS public.editions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  source_file_name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed')),
  progress INTEGER DEFAULT 0,
  total_missions INTEGER DEFAULT 0,
  total_time_estimate_minutes INTEGER DEFAULT 0,
  cover_emoji TEXT DEFAULT '📄',
  theme_color TEXT DEFAULT 'bg-[#6D4AFF]',
  tags TEXT[] DEFAULT '{}',
  raw_source_text TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on editions
ALTER TABLE public.editions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own editions"
  ON public.editions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own editions"
  ON public.editions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own editions"
  ON public.editions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own editions"
  ON public.editions FOR DELETE
  USING (auth.uid() = user_id);


-- 4. Missions Table
CREATE TABLE IF NOT EXISTS public.missions (
  id TEXT PRIMARY KEY,
  edition_id TEXT NOT NULL REFERENCES public.editions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_num INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  reading_estimate_minutes INTEGER NOT NULL,
  word_count INTEGER NOT NULL,
  key_takeaways TEXT[] DEFAULT '{}',
  done BOOLEAN DEFAULT FALSE,
  page_number INTEGER,
  char_start INTEGER NOT NULL,
  char_end INTEGER NOT NULL,
  raw_snippet TEXT NOT NULL,
  source_locator TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on missions
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own missions"
  ON public.missions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own missions"
  ON public.missions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own missions"
  ON public.missions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own missions"
  ON public.missions FOR DELETE
  USING (auth.uid() = user_id);


-- 5. Quiz Questions Table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  explanation TEXT NOT NULL,
  page_number INTEGER,
  char_start INTEGER NOT NULL,
  char_end INTEGER NOT NULL,
  raw_snippet TEXT NOT NULL,
  source_locator TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz questions"
  ON public.quiz_questions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz questions"
  ON public.quiz_questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- 6. Flashcards Table
CREATE TABLE IF NOT EXISTS public.flashcards (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  page_number INTEGER,
  char_start INTEGER NOT NULL,
  char_end INTEGER NOT NULL,
  raw_snippet TEXT NOT NULL,
  source_locator TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own flashcards"
  ON public.flashcards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flashcards"
  ON public.flashcards FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- 7. User Progress Tracking
CREATE TABLE IF NOT EXISTS public.user_progress (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id TEXT NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  quiz_score INTEGER DEFAULT 0,
  cards_reviewed INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and update own progress"
  ON public.user_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- 8. Storage RLS Policies for Private Document Bucket
-- Bucket name: 'documents'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload documents into their own isolated folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read only documents in their own isolated folder"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete only documents in their own isolated folder"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
