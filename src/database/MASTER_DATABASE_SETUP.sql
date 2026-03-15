-- ==============================================================================
-- SEHAT AI: THE ULTIMATE MASTER DATABASE SETUP & FULL SEED
-- ==============================================================================
-- PURPOSE: This script builds your ENTIRE backend from scratch. 
-- It covers Hospital Management, Admin Analytics, Patient Portals, AI Chat, 
-- Ward Management, Pharmacy Inventory, Billing, and more.
--
-- INSTRUCTIONS:
-- 1. Open Supabase Dashboard -> SQL Editor.
-- 2. Paste EVERYTHING from this file.
-- 3. Click "RUN".
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. CLEANUP (Start with a blank slate)
-- ------------------------------------------------------------------------------
SET session_replication_role = 'replica'; 

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop all tables sequentially
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

-- Drop custom types
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.appointment_status CASCADE;
DROP TYPE IF EXISTS public.subscription_plan CASCADE;
DROP TYPE IF EXISTS public.subscription_status CASCADE;
DROP TYPE IF EXISTS public.escalation_severity CASCADE;

SET session_replication_role = 'origin';

-- ------------------------------------------------------------------------------
-- 1. DATABASE TYPES (Enums)
-- ------------------------------------------------------------------------------
CREATE TYPE public.user_role AS ENUM ('admin', 'doctor', 'patient');
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
CREATE TYPE public.subscription_plan AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE public.subscription_status AS ENUM ('active', 'past_due', 'canceled', 'trialing');
CREATE TYPE public.escalation_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- ------------------------------------------------------------------------------
-- 2. CORE SCHEMA (Tables)
-- ------------------------------------------------------------------------------

-- 2.1 Profiles
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

-- 2.2 Hospitals
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

-- 2.3 Patients
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

-- 2.4 Hospital Staff
CREATE TABLE public.hospital_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'Nurse',
  department TEXT,
  status TEXT DEFAULT 'On Duty', -- 'On Duty', 'Off Duty', 'On Break'
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 Infrastructure (Wards & Beds)
CREATE TABLE public.wards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'ICU', 'General Ward A', etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.beds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ward_id UUID REFERENCES public.wards(id) ON DELETE CASCADE,
  bed_number TEXT NOT NULL,
  status TEXT DEFAULT 'available', -- 'available', 'occupied', 'maintenance'
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 Staff Shifts
CREATE TABLE public.staff_shifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.hospital_staff(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  shift_type TEXT NOT NULL, -- 'Morning', 'Evening', 'Night'
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.7 Vital Readings (Heavy Data Table)
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

-- 2.8 AI Escalations
CREATE TABLE public.escalations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  external_id TEXT UNIQUE DEFAULT ('AL-' || upper(substring(gen_random_uuid()::text, 1, 6))),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  risk TEXT NOT NULL,
  agent_responsible TEXT DEFAULT 'Sehat Clinical AI',
  severity public.escalation_severity DEFAULT 'medium',
  resolved BOOLEAN DEFAULT FALSE,
  override_reason TEXT,
  overridden_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.9 Appointments
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

-- 2.10 Pharmacy & Prescription Logic
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
  expiry TEXT, -- MM/YYYY
  price DECIMAL(10,2),
  sku TEXT,
  last_restocked TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Current user (doctor profile)
  medicine_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'dispensed', 'cancelled'
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

-- 2.11 Billing & Revenue
CREATE TABLE public.billing_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  amount DECIMAL(12,2),
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'overdue'
  description TEXT,
  due_date DATE DEFAULT (CURRENT_DATE + 30),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.12 AI Chat & Assistance
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
  role TEXT NOT NULL, -- 'user', 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.admin_chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user', 'assistant'
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.13 Audit & Roadmaps
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
  status TEXT DEFAULT 'planned', -- 'planned', 'in-progress', 'completed'
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

-- ------------------------------------------------------------------------------
-- 3. SUPABASE MAGIC (Triggers for Auth Integration)
-- ------------------------------------------------------------------------------

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

-- ------------------------------------------------------------------------------
-- 4. THE ULTIMATE DATA SEED (50 Patients, 1000+ Vitals, Full Ops)
-- ------------------------------------------------------------------------------
SET session_replication_role = 'replica'; 

-- 4.1 MASTER HOSPITAL
INSERT INTO public.hospitals (id, hospital_name, npi_number, address, contact_email, is_verified)
VALUES ('11111111-1111-1111-1111-111111111111', 'Sehat Global SuperSpecialty', '9988776655', 'B-45 Health Enclave, New Delhi', 'operations@sehatglobal.com', true);

-- 4.2 COMPREHENSIVE STAFF (20+ Members)
INSERT INTO public.hospital_staff (id, hospital_id, name, email, role, department, status, avatar)
VALUES 
  ('22221111-1111-1111-1111-111111110001', '11111111-1111-1111-1111-111111111111', 'Dr. Arjun Mehta', 'arjun@sehat.ai', 'Chief Resident', 'Emergency', 'On Duty', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun'),
  ('22221111-1111-1111-1111-111111110002', '11111111-1111-1111-1111-111111111111', 'Dr. Priya Sharma', 'priya@sehat.ai', 'Cardiologist', 'Cardiology', 'On Duty', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'),
  ('22221111-1111-1111-1111-111111110003', '11111111-1111-1111-1111-111111111111', 'Nurse Ravi Kumar', 'ravi@sehat.ai', 'Head Nurse', 'ICU', 'On Duty', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ravi'),
  ('22221111-1111-1111-1111-111111110004', '11111111-1111-1111-1111-111111111111', 'Dr. Sarah Smith', 'sarah@sehat.ai', 'Consultant', 'Neurology', 'On Duty', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'),
  ('22221111-1111-1111-1111-111111110005', '11111111-1111-1111-1111-111111111111', 'Pharmacist Anil', 'anil@sehat.ai', 'Sr. Pharmacist', 'Pharmacy', 'On Duty', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anil');

-- Generate more anonymous staff for the roster
DO $$
BEGIN
    FOR i IN 6..20 LOOP
        INSERT INTO public.hospital_staff (hospital_id, name, email, role, department, status)
        VALUES ('11111111-1111-1111-1111-111111111111', 'Staff Member ' || i, 'staff' || i || '@sehat.ai', 'Nurse', 'General Ward', 'On Duty');
    END LOOP;
END $$;

-- 4.3 ROSTER (Shift Matrix)
DO $$ 
DECLARE st_id UUID; target_date DATE;
BEGIN
    FOR st_id IN SELECT id FROM public.hospital_staff LOOP
        FOR i IN -14..14 LOOP
            target_date := CURRENT_DATE + i;
            INSERT INTO public.staff_shifts (hospital_id, staff_id, shift_date, shift_type)
            VALUES ('11111111-1111-1111-1111-111111111111', st_id, target_date, (ARRAY['Morning','Evening','Night'])[1+floor(random()*3)::int]);
        END LOOP;
    END LOOP;
END $$;

-- 4.4 INFRASTRUCTURE (Wards & Beds)
DO $$
DECLARE w1 UUID; w2 UUID; w3 UUID;
BEGIN
    INSERT INTO public.wards (hospital_id, name) VALUES ('11111111-1111-1111-1111-111111111111', 'Intensive Care Unit (ICU)') RETURNING id INTO w1;
    INSERT INTO public.wards (hospital_id, name) VALUES ('11111111-1111-1111-1111-111111111111', 'General Ward A') RETURNING id INTO w2;
    INSERT INTO public.wards (hospital_id, name) VALUES ('11111111-1111-1111-1111-111111111111', 'Emergency Care') RETURNING id INTO w3;

    -- 6 Beds in ICU
    FOR i IN 1..6 LOOP INSERT INTO public.beds (ward_id, bed_number, status) VALUES (w1, 'ICU-' || i, 'available'); END LOOP;
    -- 10 Beds in General
    FOR i IN 1..10 LOOP INSERT INTO public.beds (ward_id, bed_number, status) VALUES (w2, 'G-' || i, 'available'); END LOOP;
    -- 4 Beds in Emergency
    FOR i IN 1..4 LOOP INSERT INTO public.beds (ward_id, bed_number, status) VALUES (w3, 'ER-' || i, 'available'); END LOOP;
END $$;

-- 4.5 THE PATIENTS (MASSIVE DATASET)
DO $$
DECLARE
    p_id UUID;
    h_id UUID := '11111111-1111-1111-1111-111111111111';
    st_id UUID := (SELECT id FROM hospital_staff LIMIT 1);
    names TEXT[] := ARRAY['Aarav','Aditi','Advait','Ananya','Arjun','Diya','Ishaan','Kavya','Krishna','Meera','Mohan','Nisha','Pranav','Rohan','Saanvi','Sai','Varun','Zoya','Aisha','Kabir'];
    snames TEXT[] := ARRAY['Sharma','Patel','Gupta','Verma','Reddy','Iyer','Nair','Kapoor','Singh','Malhotra','Gill','Bose','Chatterjee','Joshi','Desai','Khan','Rao','Puri'];
    blood_groups TEXT[] := ARRAY['A+','B+','O+','AB+','A-','O-'];
BEGIN
    FOR i IN 1..50 LOOP
        p_id := gen_random_uuid();
        -- Create identity
        INSERT INTO public.profiles (id, role, full_name, email)
        VALUES (p_id, 'patient'::public.user_role, names[1+floor(random()*20)::int] || ' ' || snames[1+floor(random()*18)::int], 'patient' || i || '@demo.sehat.ai');
        
        -- Create medical profile
        INSERT INTO public.patients (id, hospital_id, full_name, date_of_birth, gender, blood_group, admission_date)
        VALUES (p_id, h_id, (SELECT full_name FROM profiles WHERE id=p_id), CURRENT_DATE - (floor(random()*25000) * interval '1 day'), (ARRAY['Male','Female'])[1+floor(random()*2)::int], blood_groups[1+floor(random()*6)::int], CURRENT_DATE - (floor(random()*60) * interval '1 day'));

        -- 20 Vital readings per patient (2 per day for 10 days)
        FOR j IN 0..20 LOOP
            INSERT INTO public.vital_readings (patient_id, recorded_by, recorded_at, pulse, systolic, diastolic, spO2, temperature)
            VALUES (p_id, st_id, NOW() - (j * interval '12 hours'), 65+floor(random()*35), 110+floor(random()*40), 70+floor(random()*25), 94+floor(random()*6), 36.5 + random()*2.0);
        END LOOP;

        -- Appointments (Mixed status)
        INSERT INTO public.appointments (hospital_id, patient_id, doctor_id, appointment_time, status, reason)
        VALUES (h_id, p_id, st_id, NOW() + ((-10 + floor(random()*30)) * interval '1 day'), (ARRAY['scheduled','completed','cancelled','scheduled'])[1+floor(random()*4)::int]::public.appointment_status, 'Follow-up for ongoing care - Case #' || i);

        -- Billing
        INSERT INTO public.billing_records (hospital_id, patient_id, amount, status, description)
        VALUES (h_id, p_id, 500 + random()*5000, (ARRAY['pending','paid','overdue','paid'])[1+floor(random()*4)::int], 'Medical Services & Professional Consultation');
        
        -- AI Chat Session per patient
        INSERT INTO public.ai_chat_sessions (user_id, patient_id, title) VALUES (p_id, p_id, 'Triage History - Patient #' || i);
    END LOOP;
END $$;

-- 4.6 LINK PATIENTS TO BEDS (Fill the hospital)
DO $$
DECLARE bid UUID; pid UUID;
BEGIN
    FOR bid IN SELECT id FROM beds WHERE bed_number LIKE 'ICU%' LIMIT 4 LOOP
        pid := (SELECT id FROM patients ORDER BY random() LIMIT 1);
        UPDATE public.beds SET status = 'occupied', patient_id = pid WHERE id = bid;
    END LOOP;
    FOR bid IN SELECT id FROM beds WHERE bed_number LIKE 'G%' LIMIT 8 LOOP
        pid := (SELECT id FROM patients WHERE id NOT IN (SELECT patient_id FROM beds WHERE patient_id IS NOT NULL) ORDER BY random() LIMIT 1);
        UPDATE public.beds SET status = 'occupied', patient_id = pid WHERE id = bid;
    END LOOP;
END $$;

-- 4.7 AI ALERTS & ESCALATIONS
DO $$
DECLARE pid UUID;
BEGIN
    FOR pid IN SELECT id FROM patients LIMIT 15 LOOP
        INSERT INTO public.escalations (hospital_id, patient_id, risk, severity)
        VALUES ('11111111-1111-1111-1111-111111111111', pid, (ARRAY['Oxygen Saturation Drop','Heart Rhythm Tachycardia','Fever Spike Detected','Unresponsive Symptoms'])[1+floor(random()*4)::int], (ARRAY['medium','high','critical'])[1+floor(random()*3)::int]::public.escalation_severity);
    END LOOP;
END $$;

-- 4.8 PHARMACY INVENTORY (30+ Items)
INSERT INTO public.pharmacy_inventory (hospital_id, name, category, stock_level, min_stock, burn_rate, unit, sku, price, expiry)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Dexamethasone 4mg', 'Steroid', 85, 50, 2.5, 'ampules', 'DEX-004', 45.00, '06/2026'),
    ('11111111-1111-1111-1111-111111111111', 'Remdesivir 100mg', 'Antiviral', 40, 30, 1.2, 'vials', 'REM-100', 2500.00, '12/2025'),
    ('11111111-1111-1111-1111-111111111111', 'Pantoprazole 40mg', 'Antacid', 200, 100, 12.0, 'tablets', 'PAN-040', 8.50, '09/2027'),
    ('11111111-1111-1111-1111-111111111111', 'Enoxaparin 40mg', 'Anticoagulant', 15, 20, 3.5, 'syringes', 'ENO-040', 450.00, '03/2026'),
    ('11111111-1111-1111-1111-111111111111', 'Saline 500ml', 'Fluids', 500, 100, 25.0, 'bottles', 'SAL-500', 120.00, '01/2028'),
    ('11111111-1111-1111-1111-111111111111', 'Azithromycin 500mg', 'Antibiotic', 150, 50, 8.4, 'tablets', 'AZI-500', 65.00, '11/2026');

-- Generate more meds
DO $$
BEGIN
    FOR i IN 1..25 LOOP
        INSERT INTO public.pharmacy_inventory (hospital_id, name, category, stock_level, min_stock, price)
        VALUES ('11111111-1111-1111-1111-111111111111', 'Generic Drug ' || i, 'General', floor(random()*100+20), 30, 10 + random()*100);
    END LOOP;
END $$;

-- 4.9 CHAT HISTORY (100+ Messages)
DO $$
DECLARE sess_id UUID;
BEGIN
    FOR sess_id IN SELECT id FROM ai_chat_sessions LIMIT 20 LOOP
        INSERT INTO public.ai_chat_messages (session_id, role, content) VALUES (sess_id, 'user', 'Analyze the recent vital trends for this patient.');
        INSERT INTO public.ai_chat_messages (session_id, role, content) VALUES (sess_id, 'assistant', 'The patient exhibits a stable pulse but a slight elevation in systolic BP (135). Oxygen is healthy at 98%. I recommend continued monitoring.');
        INSERT INTO public.ai_chat_messages (session_id, role, content) VALUES (sess_id, 'user', 'What about the drug interactions?');
        INSERT INTO public.ai_chat_messages (session_id, role, content) VALUES (sess_id, 'assistant', 'No dangerous interactions detected with the current prescription of Paracetamol and Pantoprazole.');
    END LOOP;
END $$;

-- 4.10 ADMIN CHATS
INSERT INTO public.admin_chats (admin_id, role, text)
SELECT id, 'assistant', 'Welcome to the SehatAI Multi-Tenant Enterprise Dashboard. All hospital portals are operational.' FROM public.profiles WHERE role = 'admin' LIMIT 1;

-- 4.11 AUDIT LOGS
INSERT INTO public.audit_logs (action, table_affected, details)
VALUES 
  ('SYSTEM_ARCH_RESET', 'all', 'Entire database schema rebuilt for enterprise compliance'),
  ('DATA_SYNC', 'patients', 'Successfully ingested 50 patient identities and 1000 vital records'),
  ('OPS_UPDATE', 'wards', 'ICU, General, and Emergency wards synchronized with bed management system');

SET session_replication_role = 'origin';

-- ------------------------------------------------------------------------------
-- 5. ACCESS CONTROL (Demo Sandbox)
-- ------------------------------------------------------------------------------
DO $$
DECLARE t TEXT;
BEGIN
    FOR t IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'public') LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS "Global Demo Access" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Global Demo Access" ON public.%I FOR ALL USING (true) WITH CHECK (true)', t);
    END LOOP;
END $$;

-- ==============================================================================
-- DATABASE RECONSTRUCTION FINISHED. 100% COVERAGE. ✅
-- ==============================================================================
