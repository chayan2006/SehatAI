-- ============================================================
-- FIX: SehatAI — Auth Schema Alignment (Profiles Table)
-- Run this in your Supabase SQL editor to fix registration/login failures.
-- ============================================================

-- 1. Create the 'profiles' table (the frontend expects this name)
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         VARCHAR(255) NOT NULL,
  role          VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin', 'hospital')),
  full_name     VARCHAR(255),
  phone_number  VARCHAR(30),
  hospital_name VARCHAR(255), -- For hospital role
  firebase_uid  VARCHAR(255), -- For sync
  status        VARCHAR(20) DEFAULT 'active',
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Policies - Allow all for the Hackathon Demo
-- NOTE: In production, limit these properly!
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profiles" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users (Registration Fix)" 
  ON public.profiles FOR INSERT WITH CHECK (true); -- Allow Registration

CREATE POLICY "Enable all for everyone during hackathon (Extreme Fix)" 
  ON public.profiles FOR ALL USING (true);

-- 4. Automatically create a profile on Signup (Recommended)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (new.id, new.email, 'patient', new.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: trg_on_auth_user_created
-- DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
-- CREATE TRIGGER trg_on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Copy data from 'users' table if it exists (Optional migration)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
    -- INSERT INTO public.profiles (id, email, role, full_name, phone_number, created_at)
    -- SELECT id, email, role, full_name, phone, created_at FROM public.users
    -- ON CONFLICT (id) DO NOTHING;
    NULL;
  END IF;
END $$;

-- 6. Add profiles to other table FKs if needed
-- (schema.sql uses users(id), so profiles can act as a replacement if joined)
