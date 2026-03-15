-- ==============================================================================
-- SEHAT AI: COMPREHENSIVE SCHEMA SETUP
-- ==============================================================================
-- PURPOSE: This script creates all tables and types for the entire project.
-- Use this FIRST to set up your database structure.
-- ==============================================================================

-- 0. CLEANUP (Start with a blank slate)
SET session_replication_role = 'replica'; 

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS public.ai_chat_messages CASCADE;
DROP TABLE IF EXISTS public.ai_chat_sessions CASCADE;
DROP TABLE IF EXISTS public.admin_chats CASCADE;
DROP TABLE IF EXISTS public.record_attachments CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.medical_records CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.vital_readings CASCADE;
DROP TABLE IF EXISTS public.escalations CASCADE;
DROP TABLE IF EXISTS public.beds CASCADE;
DROP TABLE IF EXISTS public.wards CASCADE;
DROP TABLE IF EXISTS public.staff_shifts CASCADE;
DROP TABLE IF EXISTS public.hospital_staff CASCADE;
DROP TABLE IF EXISTS public.dispensing_logs CASCADE;
DROP TABLE IF EXISTS public.prescriptions CASCADE;
DROP TABLE IF EXISTS public.pharmacy_inventory CASCADE;
DROP TABLE IF EXISTS public.billing_records CASCADE;
DROP TABLE IF EXISTS public.roadmaps CASCADE;
DROP TABLE IF EXISTS public.domains CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.hospitals CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.appointment_status CASCADE;
DROP TYPE IF EXISTS public.subscription_plan CASCADE;
DROP TYPE IF EXISTS public.subscription_status CASCADE;
DROP TYPE IF EXISTS public.escalation_severity CASCADE;

SET session_replication_role = 'origin';

-- 1. CUSTOM TYPES
CREATE TYPE public.user_role AS ENUM ('admin', 'doctor', 'patient');
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
CREATE TYPE public.subscription_plan AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE public.subscription_status AS ENUM ('active', 'past_due', 'canceled', 'trialing');
CREATE TYPE public.escalation_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- 2. CORE TABLES
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role public.user_role NOT NULL DEFAULT 'patient',
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.hospitals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  hospital_name TEXT NOT NULL,
  npi_number TEXT,
  address TEXT,
  contact_email TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.patients (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
  full_name TEXT,
  external_id TEXT UNIQUE DEFAULT ('PX-' || upper(substring(gen_random_uuid()::text, 1, 6))),
  date_of_birth DATE,
  gender TEXT,
  blood_group TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_history_summary TEXT,
  admission_date DATE DEFAULT CURRENT_DATE,
  discharge_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.hospital_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'Nurse',
  department TEXT,
  status TEXT DEFAULT 'On Duty',
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.wards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.beds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ward_id UUID REFERENCES public.wards(id) ON DELETE CASCADE,
  bed_number TEXT NOT NULL,
  status TEXT DEFAULT 'available',
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.staff_shifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.hospital_staff(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  shift_type TEXT NOT NULL,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.vital_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  recorded_by UUID REFERENCES public.hospital_staff(id) ON DELETE SET NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  pulse INTEGER,
  systolic INTEGER,
  diastolic INTEGER,
  spO2 INTEGER,
  temperature FLOAT
);

CREATE TABLE public.escalations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  external_id TEXT UNIQUE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  risk TEXT NOT NULL,
  agent_responsible TEXT DEFAULT 'Sehat Clinical AI',
  severity public.escalation_severity DEFAULT 'medium',
  resolved BOOLEAN DEFAULT FALSE,
  override_reason TEXT,
  overridden_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.hospital_staff(id) ON DELETE SET NULL,
  appointment_time TIMESTAMPTZ NOT NULL,
  status public.appointment_status DEFAULT 'scheduled',
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.pharmacy_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  stock_level INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 50,
  burn_rate FLOAT DEFAULT 0.0,
  unit TEXT DEFAULT 'units',
  status TEXT DEFAULT 'available',
  expiry TEXT,
  price DECIMAL(10,2),
  sku TEXT,
  last_restocked TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  medicine_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.dispensing_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  medicine_name TEXT,
  quantity INTEGER,
  dispensed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.billing_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  amount DECIMAL(12,2),
  status TEXT DEFAULT 'pending',
  description TEXT,
  due_date DATE DEFAULT (CURRENT_DATE + 30),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.ai_chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  title TEXT DEFAULT 'Clinical Consultation',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.ai_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.admin_chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_affected TEXT,
  record_id UUID,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.roadmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id UUID NOT NULL, 
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planned',
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TRIGGER FOR AUTH
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  extracted_role public.user_role;
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'admin' THEN extracted_role := 'admin'::public.user_role;
  ELSIF NEW.raw_user_meta_data->>'role' = 'doctor' THEN extracted_role := 'doctor'::public.user_role;
  ELSE extracted_role := 'patient'::public.user_role; END IF;

  INSERT INTO public.profiles (id, role, full_name, email)
  VALUES (NEW.id, extracted_role, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email);

  IF extracted_role = 'patient' THEN
    INSERT INTO public.patients (id, full_name) 
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. RLS SANDBOX (Demo mode - Enable All)
DO $$
DECLARE t TEXT;
BEGIN
    FOR t IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'public') LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS "Global Demo Access" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Global Demo Access" ON public.%I FOR ALL USING (true) WITH CHECK (true)', t);
    END LOOP;
END $$;
