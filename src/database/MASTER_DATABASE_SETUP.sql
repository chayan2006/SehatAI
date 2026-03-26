-- ==============================================================================
-- SEHAT AI: MASTER DATABASE SETUP (SCHEMA + SEED DATA)
-- ==============================================================================
-- PURPOSE: This script creates all tables, types, and populates the database 
-- with massive, realistic data in a single run.
-- Use this to set up or recreate your entire database structure.
-- ==============================================================================

-- 0. CLEANUP (Start with a blank slate)
SET session_replication_role = 'replica'; 

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS public.consultations CASCADE;
DROP TABLE IF EXISTS public.ambulance_dispatches CASCADE;
DROP TABLE IF EXISTS public.triage_records CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
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
DROP TABLE IF EXISTS public.lab_results CASCADE;
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
  consultation_fee DECIMAL(12,2) DEFAULT 0.00,
  rating DECIMAL(3,2) DEFAULT 0.00,
  specialties TEXT[] DEFAULT '{}',
  emergency_24h BOOLEAN DEFAULT FALSE,
  nabh_certified BOOLEAN DEFAULT FALSE,
  payment_methods TEXT[] DEFAULT '{}',
  operating_hours JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
  full_name TEXT,
  age INTEGER,
  condition TEXT,
  status TEXT DEFAULT 'Stable',
  risk_score INTEGER DEFAULT 0,
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
  type TEXT,
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
  services TEXT,
  provider TEXT,
  description TEXT,
  due_date DATE DEFAULT (CURRENT_DATE + 30),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.lab_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  category TEXT,
  result_value TEXT,
  unit TEXT,
  reference_range TEXT,
  status TEXT DEFAULT 'Pending',
  doctor_notes TEXT,
  ai_summary TEXT,
  ordered_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
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

CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.triage_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_age INTEGER,
  type TEXT NOT NULL,
  description TEXT,
  ai_action TEXT,
  status TEXT DEFAULT 'Pending Review',
  notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.ambulance_dispatches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_contact TEXT,
  pickup_address TEXT NOT NULL,
  destination_address TEXT,
  driver_name TEXT,
  vehicle_number TEXT,
  status TEXT DEFAULT 'Dispatched',
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
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


-- ==============================================================================
-- 5. SEHAT AI: THE ULTIMATE DATA SEED (PHASE 2)
-- ==============================================================================

SET session_replication_role = 'replica'; -- Bypass FK constraints for seeding

-- 1. MASTER HOSPITAL
INSERT INTO public.hospitals (id, hospital_name, npi_number, address, contact_email, is_verified)
VALUES ('11111111-1111-1111-1111-111111111111', 'Sehat Global SuperSpecialty', '9988776655', 'B-45 Health Enclave, New Delhi', 'operations@sehatglobal.com', true);

-- 2. COMPREHENSIVE STAFF (20+ Members)
INSERT INTO public.hospital_staff (id, hospital_id, name, email, role, department, status, avatar)
VALUES 
  ('22221111-1111-1111-1111-111111110001', '11111111-1111-1111-1111-111111111111', 'Dr. Arjun Mehta', 'arjun@sehat.ai', 'Chief Resident', 'Emergency', 'On Duty', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun'),
  ('22221111-1111-1111-1111-111111110002', '11111111-1111-1111-1111-111111111111', 'Dr. Priya Sharma', 'priya@sehat.ai', 'Cardiologist', 'Cardiology', 'On Duty', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'),
  ('22221111-1111-1111-1111-111111110003', '11111111-1111-1111-1111-111111111111', 'Nurse Ravi Kumar', 'ravi@sehat.ai', 'Head Nurse', 'ICU', 'On Duty', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ravi'),
  ('22221111-1111-1111-1111-111111110004', '11111111-1111-1111-1111-111111111111', 'Dr. Sarah Smith', 'sarah@sehat.ai', 'Consultant', 'Neurology', 'On Duty', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'),
  ('22221111-1111-1111-1111-111111110005', '11111111-1111-1111-1111-111111111111', 'Pharmacist Anil', 'anil@sehat.ai', 'Sr. Pharmacist', 'Pharmacy', 'On Duty', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anil');

DO $$
BEGIN
    FOR i IN 6..25 LOOP
        INSERT INTO public.hospital_staff (hospital_id, name, email, role, department, status)
        VALUES ('11111111-1111-1111-1111-111111111111', 'Staff Member ' || i, 'staff' || i || '@sehat.ai', 'Nurse', 'General Ward', 'On Duty');
    END LOOP;
END $$;

-- 3. ROSTER / SHIFTS
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

-- 4. INFRASTRUCTURE (Wards & Beds)
DO $$
DECLARE w1 UUID; w2 UUID; w3 UUID;
BEGIN
    INSERT INTO public.wards (hospital_id, name) VALUES ('11111111-1111-1111-1111-111111111111', 'Intensive Care Unit (ICU)') RETURNING id INTO w1;
    INSERT INTO public.wards (hospital_id, name) VALUES ('11111111-1111-1111-1111-111111111111', 'General Ward A') RETURNING id INTO w2;
    INSERT INTO public.wards (hospital_id, name) VALUES ('11111111-1111-1111-1111-111111111111', 'Emergency Care') RETURNING id INTO w3;

    FOR i IN 1..8 LOOP INSERT INTO public.beds (ward_id, bed_number, status) VALUES (w1, 'ICU-' || i, 'available'); END LOOP;
    FOR i IN 1..15 LOOP INSERT INTO public.beds (ward_id, bed_number, status) VALUES (w2, 'G-' || i, 'available'); END LOOP;
    FOR i IN 1..6 LOOP INSERT INTO public.beds (ward_id, bed_number, status) VALUES (w3, 'ER-' || i, 'available'); END LOOP;
END $$;

-- 5. THE PATIENTS (50+ Profiles)
DO $$
DECLARE
    p_id UUID;
    h_id UUID := '11111111-1111-1111-1111-111111111111';
    st_id UUID := (SELECT id FROM hospital_staff LIMIT 1);
    names TEXT[] := ARRAY['Aarav','Aditi','Advait','Ananya','Arjun','Diya','Ishaan','Kavya','Krishna','Meera','Mohan','Nisha','Pranav','Rohan','Saanvi','Sai','Varun','Zoya','Aisha','Kabir','Rehan','Kiara','Dev','Tanya'];
    snames TEXT[] := ARRAY['Sharma','Patel','Gupta','Verma','Reddy','Iyer','Nair','Kapoor','Singh','Malhotra','Gill','Bose','Chatterjee','Joshi','Desai','Khan','Rao','Puri','Dubey','Yadav'];
BEGIN
    FOR i IN 1..55 LOOP
        p_id := gen_random_uuid();
        INSERT INTO public.profiles (id, role, full_name, email)
        VALUES (p_id, 'patient'::public.user_role, names[1+floor(random()*24)::int] || ' ' || snames[1+floor(random()*20)::int], 'patient' || i || '@demo.sehat.ai');
        
        INSERT INTO public.patients (id, hospital_id, full_name, date_of_birth, gender, blood_group, admission_date)
        VALUES (p_id, h_id, (SELECT full_name FROM profiles WHERE id=p_id), CURRENT_DATE - (floor(random()*25000) * interval '1 day'), (ARRAY['Male','Female'])[1+floor(random()*2)::int], (ARRAY['A+','B+','O+','AB+','A-','O-'])[1+floor(random()*6)::int], CURRENT_DATE - (floor(random()*60) * interval '1 day'));

        -- Vitals (10 days x 2 readings = 20 entries)
        FOR j IN 0..20 LOOP
            INSERT INTO public.vital_readings (patient_id, recorded_by, recorded_at, pulse, systolic, diastolic, spO2, temperature)
            VALUES (p_id, st_id, NOW() - (j * interval '12 hours'), 65+floor(random()*35), 110+floor(random()*40), 70+floor(random()*25), 94+floor(random()*6), 36.5 + random()*2.0);
        END LOOP;

        INSERT INTO public.appointments (hospital_id, patient_id, doctor_id, appointment_time, status, reason)
        VALUES (h_id, p_id, st_id, NOW() + ((-10 + floor(random()*30)) * interval '1 day'), (ARRAY['scheduled','completed','cancelled'])[1+floor(random()*3)::int]::public.appointment_status, 'Review Case #' || i);

        INSERT INTO public.billing_records (hospital_id, patient_id, amount, status, description)
        VALUES (h_id, p_id, 1000 + random()*10000, (ARRAY['pending','paid','overdue'])[1+floor(random()*3)::int], 'Medical Treatment Package');
        
        INSERT INTO public.ai_chat_sessions (user_id, patient_id, title) VALUES (p_id, p_id, 'Triage History #' || i);
    END LOOP;
END $$;

-- 6. LIVE BED OCCUPANCY
DO $$
DECLARE bid UUID; pid UUID;
BEGIN
    FOR bid IN SELECT id FROM beds WHERE bed_number LIKE 'ICU%' LIMIT 6 LOOP
        pid := (SELECT id FROM patients ORDER BY random() LIMIT 1);
        UPDATE public.beds SET status = 'occupied', patient_id = pid WHERE id = bid;
    END LOOP;
END $$;

-- 7. ESCALATIONS
DO $$
DECLARE pid UUID;
BEGIN
    FOR pid IN SELECT id FROM patients LIMIT 20 LOOP
        INSERT INTO public.escalations (hospital_id, patient_id, risk, severity, external_id)
        VALUES ('11111111-1111-1111-1111-111111111111', pid, (ARRAY['Drop in SpO2','Pulse Over 120','Critical BP Spike','Persistent High Fever'])[1+floor(random()*4)::int], (ARRAY['medium','high','critical'])[1+floor(random()*3)::int]::public.escalation_severity, 'ALRT-' || upper(substring(gen_random_uuid()::text, 1, 6)));
    END LOOP;
END $$;

-- 8. PHARMACY INVENTORY (50+ Items)
DO $$
BEGIN
    FOR i IN 1..50 LOOP
        INSERT INTO public.pharmacy_inventory (hospital_id, name, category, stock_level, min_stock, price, sku, status)
        VALUES ('11111111-1111-1111-1111-111111111111', 'Medicine ' || i, (ARRAY['Antibiotic','Cardiac','Steroid','Fluids','Antacid'])[1+floor(random()*5)::int], floor(random()*200+10), 40, 50.0 + random()*500, 'MED-' || i, (ARRAY['available','low stock'])[1+floor(random()*2)::int]);
    END LOOP;
END $$;

-- 8.1. TRIAGE RECORDS (Emergency Cases)
DO $$
BEGIN
    FOR i IN 1..15 LOOP
        INSERT INTO public.triage_records (hospital_id, patient_name, patient_age, type, description, ai_action, status)
        VALUES (
          '11111111-1111-1111-1111-111111111111', 
          'Emergency Patient ' || i, 
          20 + floor(random()*60), 
          (ARRAY['Cardiac','Trauma','Respiratory','Neurological','Sepsis'])[1+floor(random()*5)::int],
          'Patient presented with acute symptoms requiring immediate triage.',
          'Recommended immediate ' || (ARRAY['ECG','CT Scan','Blood Work','O2 Therapy'])[1+floor(random()*4)::int],
          (ARRAY['Pending Review','In Progress','Resolved'])[1+floor(random()*3)::int]
        );
    END LOOP;
END $$;

-- 8.2. AMBULANCE DISPATCHES
DO $$
BEGIN
    FOR i IN 1..10 LOOP
        INSERT INTO public.ambulance_dispatches (hospital_id, patient_name, patient_contact, pickup_address, destination_address, driver_name, vehicle_number, status)
        VALUES (
          '11111111-1111-1111-1111-111111111111', 
          'Dispatch Case ' || i, 
          '+91 987654321' || i, 
          'Sector ' || floor(random()*50) || ', City Center', 
          'Sehat Global SuperSpecialty', 
          'Driver ' || (ARRAY['Ramesh','Suresh','Mukesh','Raju'])[1+floor(random()*4)::int], 
          'DL-1C-' || (1000 + floor(random()*8999)), 
          (ARRAY['Dispatched','Arrived','Completed'])[1+floor(random()*3)::int]
        );
    END LOOP;
END $$;

-- 8.3. CONSULTATIONS
DO $$
DECLARE st_id UUID := (SELECT id FROM profiles WHERE role='doctor' LIMIT 1);
BEGIN
    IF st_id IS NULL THEN st_id := (SELECT id FROM profiles LIMIT 1); END IF;
    FOR i IN 1..20 LOOP
        INSERT INTO public.consultations (hospital_id, doctor_id, patient_name, subjective, objective, assessment, plan)
        VALUES (
          '11111111-1111-1111-1111-111111111111', 
          st_id, 
          'Consult Patient ' || i, 
          'Patient complains of ' || (ARRAY['headache','chest pain','fever','fatigue'])[1+floor(random()*4)::int], 
          'Vitals stable. BP normal. Mild tachycardia.', 
          'Suspected ' || (ARRAY['viral infection','migraine','hypertension','anxiety'])[1+floor(random()*4)::int], 
          'Prescribed rest and medication. Follow up in 3 days.'
        );
    END LOOP;
END $$;

-- 8.4. NOTIFICATIONS
DO $$
BEGIN
    FOR i IN 1..10 LOOP
        INSERT INTO public.notifications (hospital_id, type, title, message, read)
        VALUES (
          '11111111-1111-1111-1111-111111111111', 
          (ARRAY['alert','warning','info','success'])[1+floor(random()*4)::int], 
          'System Notification ' || i, 
          'This is an automated system notification regarding recent activities in the hospital.', 
          (floor(random()*2) = 1)
        );
    END LOOP;
END $$;

-- 9. ROADMAPS & DOMAINS
INSERT INTO public.domains (name, description, icon, category)
VALUES 
  ('Cardiovascular AI', 'Deep learning for arrhythmia detection', 'Activity', 'Clinical'),
  ('Neurological Sink', 'Brain wave integration and mapping', 'Brain', 'Expert'),
  ('Smart Inventory', 'Blockchain based drug tracking', 'Package', 'Infrastructure'),
  ('Patient X-Port', 'Inter-hospital data standard', 'Database', 'Admin');

INSERT INTO public.roadmaps (entity_id, title, description, status, due_date)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Phase 3: Tele-Health Integration', 'Adding WebRTC support for remote consults', 'in-progress', CURRENT_DATE + 30),
  ('11111111-1111-1111-1111-111111111111', 'AI Bed Allocation', 'Automated ward optimization engine', 'planned', CURRENT_DATE + 90),
  ('11111111-1111-1111-1111-111111111111', 'Compliance Update v2', 'HIPAA 2026 Audit and logs', 'planned', CURRENT_DATE + 120);

-- 10. CHAT DATA
DO $$
DECLARE sess_id UUID;
BEGIN
    FOR sess_id IN SELECT id FROM ai_chat_sessions LIMIT 30 LOOP
        INSERT INTO public.ai_chat_messages (session_id, role, content) VALUES (sess_id, 'user', 'Analyze my latest vital signs.');
        INSERT INTO public.ai_chat_messages (session_id, role, content) VALUES (sess_id, 'assistant', 'Your vitals show a pulse of 82 and SpO2 of 97%. Temperature is normal at 36.6C. You are within healthy ranges.');
    END LOOP;
END $$;

-- 11. ADMIN CHATS
INSERT INTO public.admin_chats (admin_id, role, text)
SELECT id, 'assistant', 'Dashboard fully operational. All hospital nodes synchronized.' FROM public.profiles WHERE role = 'admin' LIMIT 1;

-- 12. AUDIT LOGS
INSERT INTO public.audit_logs (action, table_affected, details)
VALUES 
  ('SEED_COMPLETE', 'all', 'Massive enterprise seed data injected successfully'),
  ('INFRA_SYNC', 'wards', 'Wards and Bed mappings verified'),
  ('AI_BOOTSTRAP', 'chats', 'AI conversation history generated for demonstration');

SET session_replication_role = 'origin';

-- ==============================================================================
-- END OF MASTER SCRIPT
-- ==============================================================================
