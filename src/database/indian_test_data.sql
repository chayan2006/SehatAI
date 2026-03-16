-- ==============================================================================
-- SehatAI: Indian-Context REALISTIC Data Migration (Safe/No Drops)
-- ==============================================================================
-- This script safely creates missing tables and populates them with realistic
-- Indian medical scenarios (Dengue, Vitamin D deficiency, etc.)
-- ==============================================================================

-- 1. Ensure Types Exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'patient');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE escalation_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. Ensure Core Tables Exist (No Drops)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'patient',
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hospitals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES public.profiles(id),
  hospital_name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safe Column Additions (Handles existing tables without new columns)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hospitals' AND column_name='specialties') THEN
        ALTER TABLE public.hospitals ADD COLUMN specialties TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hospitals' AND column_name='consultation_fee') THEN
        ALTER TABLE public.hospitals ADD COLUMN consultation_fee INTEGER DEFAULT 500;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hospitals' AND column_name='rating') THEN
        ALTER TABLE public.hospitals ADD COLUMN rating FLOAT DEFAULT 4.5;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.patients (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  date_of_birth DATE,
  gender TEXT,
  blood_group TEXT,
  medical_history_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.profiles(id),
  hospital_id UUID REFERENCES public.hospitals(id),
  appointment_time TIMESTAMPTZ NOT NULL,
  status appointment_status DEFAULT 'scheduled',
  reason_for_visit TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.profiles(id),
  appointment_id UUID REFERENCES public.appointments(id),
  diagnosis TEXT,
  visit_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safe Column Additions for medical_records
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='medical_records' AND column_name='prescription_data') THEN
        ALTER TABLE public.medical_records ADD COLUMN prescription_data JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='medical_records' AND column_name='vital_signs') THEN
        ALTER TABLE public.medical_records ADD COLUMN vital_signs JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='medical_records' AND column_name='ai_analysis_summary') THEN
        ALTER TABLE public.medical_records ADD COLUMN ai_analysis_summary TEXT;
    END IF;
END $$;

-- 3. Populate Indian-Context Data
DO $$
DECLARE
    h_id UUID;
    p_id UUID;
    doc_id UUID;
BEGIN
    -- Create Hospital
    INSERT INTO public.hospitals (hospital_name, address, specialties, consultation_fee, is_verified)
    VALUES ('Apollo Indraprastha', 'Mathura Rd, New Delhi, India', ARRAY['Cardiology', 'Neurology', 'Oncology'], 1200, true)
    ON CONFLICT DO NOTHING
    RETURNING id INTO h_id;

    IF h_id IS NULL THEN SELECT id INTO h_id FROM public.hospitals WHERE hospital_name = 'Apollo Indraprastha' LIMIT 1; END IF;

    -- Create/Update Patient
    -- Attempt to find existing user or dummy
    SELECT id INTO p_id FROM public.profiles WHERE role = 'patient' LIMIT 1;
    IF p_id IS NULL THEN
        p_id := gen_random_uuid();
        INSERT INTO public.profiles (id, role, full_name, email) 
        VALUES (p_id, 'patient', 'Arjun Mehra', 'arjun.mehra@example.in');
        INSERT INTO public.patients (id, date_of_birth, gender, blood_group, medical_history_summary)
        VALUES (p_id, '1992-05-15', 'Male', 'O+', 'Recovered from Dengue in Oct 2025.');
    END IF;

    -- Add Clinical History (Indian Scenarios)
    INSERT INTO public.medical_records (patient_id, diagnosis, prescription_data, ai_analysis_summary, visit_date)
    VALUES 
        (p_id, 'Post-Dengue Recovery & Platelet Management', 
         '{"medication": "Caripill", "dosage": "1100mg", "frequency": "Three times daily", "price": 450}', 
         'Patient shows significant improvement in platelet count (now 1.8 Lacs). Advised to continue hydration and Caripill for 3 more days.', 
         NOW() - interval '3 days'),
        
        (p_id, 'Vitamin D3 & B12 Deficiency', 
         '{"medication": "Uprise-D3 60K", "dosage": "1 Sachet", "frequency": "Once a week for 8 weeks", "price": 120}', 
         'Serum Vitamin D levels extremely low (12 ng/mL). Aggressive supplementation required. Patient reports fatigue and body aches.', 
         NOW() - interval '20 days'),
        
        (p_id, 'Mild Anemia (Iron Deficiency)', 
         '{"medication": "Dexorange Syrup", "dosage": "10ml", "frequency": "Twice daily after meals", "price": 180}', 
         'Hb is 10.2 g/dL. Iron stores are depleted. Recommended high protein diet and jaggery-chana consumption.', 
         NOW() - interval '45 days');

    -- Add Latest Vitals
    INSERT INTO public.medical_records (patient_id, diagnosis, vital_signs, visit_date)
    VALUES (p_id, 'Weekly Health Sync', '{"pulse": 76, "blood_pressure": "118/78", "spo2": 99, "glucose": 110}', NOW());

END $$;

-- 4. Restore Constraints (Safe)
SET session_replication_role = 'origin';

-- ==============================================================================
-- End of Indian-Context Migration
-- ==============================================================================
