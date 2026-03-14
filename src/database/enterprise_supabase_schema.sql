-- ==============================================================================
-- SehatAI Full Enterprise Database Architecture
-- Includes Auth, RLS, Triggers, Billing, AI AI Chat History, Audit Logs
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. CLEANUP EXISTING OLD TABLES & TYPES 
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop new enterprise tables
DROP TABLE IF EXISTS public.ai_chat_messages CASCADE;
DROP TABLE IF EXISTS public.ai_chat_sessions CASCADE;
DROP TABLE IF EXISTS public.record_attachments CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;

-- Drop core tables
DROP TABLE IF EXISTS public.medical_records CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.hospital_staff CASCADE;
DROP TABLE IF EXISTS public.hospitals CASCADE;
DROP TABLE IF EXISTS public.roadmaps CASCADE;
DROP TABLE IF EXISTS public.domains CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS appointment_status CASCADE;
DROP TYPE IF EXISTS subscription_plan CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;

-- ------------------------------------------------------------------------------
-- 1. ENUMS (Custom Data Types)
-- ------------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'patient');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'trialing');

-- ------------------------------------------------------------------------------
-- 2. CORE USERS & PROFILES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'patient',
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are readable by authenticated users" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 3. HOSPITALS / CLINICS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hospitals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
  hospital_name TEXT NOT NULL,
  npi_number TEXT,
  address TEXT,
  contact_email TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hospitals are public" ON public.hospitals FOR SELECT USING (true);
CREATE POLICY "Admins can update their hospitals" ON public.hospitals FOR UPDATE USING (auth.uid() = admin_id);

-- ------------------------------------------------------------------------------
-- 4. HOSPITAL STAFF (Mapping)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hospital_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialty TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hospital_id, doctor_id)
);

ALTER TABLE public.hospital_staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff mappings are readable by authenticated users" ON public.hospital_staff FOR SELECT USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- 5. PATIENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  date_of_birth DATE,
  gender TEXT,
  blood_group TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_history_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients view own data" ON public.patients FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin')));
CREATE POLICY "Patients update own data" ON public.patients FOR UPDATE USING (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 6. APPOINTMENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  appointment_time TIMESTAMPTZ NOT NULL,
  status appointment_status DEFAULT 'scheduled',
  reason_for_visit TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients see own appointments" ON public.appointments FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Doctors see their appointments" ON public.appointments FOR SELECT USING (auth.uid() = doctor_id);

-- ------------------------------------------------------------------------------
-- 7. MEDICAL RECORDS (Health Data)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  diagnosis TEXT,
  prescription_data JSONB,
  vital_signs JSONB,
  ai_analysis_summary TEXT,
  visit_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients view own records" ON public.medical_records FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Doctors view all records" ON public.medical_records FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin')));

-- ------------------------------------------------------------------------------
-- 8. ENTERPRISE ADDITIONS (Billing, Audit, Attachments, AI History)
-- ------------------------------------------------------------------------------

-- 8.1 SUBSCRIPTIONS & BILLING (For B2B AI software sales)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_type subscription_plan DEFAULT 'free',
  status subscription_status DEFAULT 'trialing',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view their hospital tracking" ON public.subscriptions FOR SELECT USING (EXISTS (SELECT 1 FROM public.hospitals WHERE id = subscriptions.hospital_id AND admin_id = auth.uid()));

-- 8.2 AUDIT LOGS (CRITICAL for Medical Compliance / HIPAA)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- e.g. 'VIEWED_MEDICAL_RECORD'
  table_affected TEXT, -- e.g. 'medical_records'
  record_id UUID,
  ip_address TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
-- Audit logs should ONLY be inserted, and only viewable by Super Admins remotely.
CREATE POLICY "Users can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8.3 FILE ATTACHMENTS (Mapping files to Supabase Storage Bucket)
CREATE TABLE IF NOT EXISTS public.record_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  medical_record_id UUID REFERENCES public.medical_records(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT, 
  storage_path TEXT NOT NULL, -- Maps to a Supabase bucket path (e.g. /scans/xray123.jpg)
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.record_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients view own attachments" ON public.record_attachments FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Doctors view attachments" ON public.record_attachments FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin')));

-- 8.4 AI CHAT SESSIONS & MESSAGES (For storing SehatAI conversations)
CREATE TABLE IF NOT EXISTS public.ai_chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE, -- Useful if discussing a specific patient
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own chat sessions" ON public.ai_chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own chat messages" ON public.ai_chat_messages FOR SELECT USING (EXISTS (SELECT 1 FROM public.ai_chat_sessions WHERE id = ai_chat_messages.session_id AND user_id = auth.uid()));


-- ------------------------------------------------------------------------------
-- 9. MISC SEHATAI FEATURES (Domains, Roadmaps)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.roadmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  domain_id UUID REFERENCES public.domains(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  milestones JSONB,
  status TEXT DEFAULT 'in_progress',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Domains public" ON public.domains FOR SELECT USING (true);
CREATE POLICY "Patients view own roadmaps" ON public.roadmaps FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Doctors view roadmaps" ON public.roadmaps FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin')));

-- ------------------------------------------------------------------------------
-- 10. AUTOMATION TRIGGERS (Auto-create profiles on signup)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  extracted_role user_role;
  extracted_hospital_name TEXT;
  new_hospital_id UUID;
BEGIN
  -- 1. Determine Role Safely
  IF NEW.raw_user_meta_data->>'role' = 'admin' THEN extracted_role := 'admin'::user_role;
  ELSIF NEW.raw_user_meta_data->>'role' = 'doctor' THEN extracted_role := 'doctor'::user_role;
  ELSE extracted_role := 'patient'::user_role; END IF;

  -- 2. Create Base Profile
  INSERT INTO public.profiles (id, role, full_name, email)
  VALUES (
    NEW.id,
    extracted_role,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );

  -- 3. Execute EXACT Role logic (Do not mix Patient and Hospital logic)
  IF extracted_role = 'patient' THEN
    -- Patient logic is simple: just add to patients table
    INSERT INTO public.patients (id) VALUES (NEW.id);
  
  ELSIF extracted_role IN ('admin', 'doctor') THEN
    extracted_hospital_name := NEW.raw_user_meta_data->>'hospital_name';
    
    IF extracted_hospital_name IS NOT NULL THEN
      -- Check if hospital exists
      SELECT id INTO new_hospital_id FROM public.hospitals WHERE hospital_name = extracted_hospital_name LIMIT 1;
      
      -- If it doesn't exist, create it (assign admin_id only if the user is an admin)
      IF new_hospital_id IS NULL THEN
        IF extracted_role = 'admin' THEN
          INSERT INTO public.hospitals (admin_id, hospital_name) VALUES (NEW.id, extracted_hospital_name) RETURNING id INTO new_hospital_id;
        ELSE 
          -- A doctor signing up for a non-existent hospital. We leave admin_id NULL.
          INSERT INTO public.hospitals (hospital_name) VALUES (extracted_hospital_name) RETURNING id INTO new_hospital_id;
        END IF;
      END IF;

      -- Map the doctor/admin to the hospital
      INSERT INTO public.hospital_staff (hospital_id, doctor_id) VALUES (new_hospital_id, NEW.id) ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error to Postgres logs but DO NOT crash the Auth user creation process!
  RAISE WARNING 'SehatAI Trigger Failed to process user data: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- END OF SCRIPT
-- ==============================================================================
