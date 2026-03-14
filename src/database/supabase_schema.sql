-- SehatAI Supabase Initial Schema & Auth Triggers
-- Run this in your Supabase SQL Editor

-- 1. Create Profiles Table (For all users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT,
  hospital_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read/update their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);


-- 2. Create Hospitals Table (For doctor/admin users)
CREATE TABLE IF NOT EXISTS public.hospitals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hospital_name TEXT NOT NULL,
  npi_number TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for hospitals
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their hospital" 
ON public.hospitals FOR SELECT 
USING (auth.uid() = admin_id);


-- 3. Create the Database Trigger Function
-- This automatically creates a profile/hospital when someone signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Insert the profile
  INSERT INTO public.profiles (id, full_name, role, hospital_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'role',
    NEW.raw_user_meta_data->>'hospital_name'
  );

  -- If the user is a doctor or admin, also create a hospital record
  IF NEW.raw_user_meta_data->>'role' IN ('doctor', 'admin') AND NEW.raw_user_meta_data->>'hospital_name' IS NOT NULL THEN
    INSERT INTO public.hospitals (admin_id, hospital_name)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'hospital_name'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. Attach the Trigger to Supabase Auth
-- This listens for new signups in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
