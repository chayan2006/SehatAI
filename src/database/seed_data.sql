-- ==============================================================================
-- SehatAI Realistic Seed Data (V4 - ULTRA STABLE / CRASH-PROOF)
-- ==============================================================================
-- INSTRUCTIONS: 
-- 1. Open your Supabase Dashboard -> SQL Editor.
-- 2. Paste this entire script and run it.
-- ==============================================================================

-- 0. BYPASS CONSTRAINTS & PREPARE
SET session_replication_role = 'replica';

-- 0.1 ENSURE ENUMS EXIST (Safe creation)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'patient');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'escalation_severity') THEN
        CREATE TYPE escalation_severity AS ENUM ('low', 'medium', 'high', 'critical');
    END IF;
END $$;

-- 0.2 SCHEMA CORRECTION (Hospital Staff & Shifts)
DO $$ 
BEGIN
    -- Ensure hospital_staff has the right columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hospital_staff' AND column_name='name') THEN
        DROP TABLE IF EXISTS public.staff_shifts CASCADE;
        DROP TABLE IF EXISTS public.hospital_staff CASCADE;
        
        CREATE TABLE public.hospital_staff (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          email TEXT UNIQUE,
          role TEXT DEFAULT 'Nurse',
          department TEXT,
          status TEXT DEFAULT 'On Duty',
          avatar TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
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
    END IF;
END $$;

-- 1. Create a Default Hospital
INSERT INTO public.hospitals (id, hospital_name, npi_number, address, contact_email, is_verified)
VALUES (
  '11111111-1111-1111-1111-111111111111', 
  'Sehat General Hospital', 
  '9876543210', 
  '123 Medical Plaza, Health City', 
  'admin@sehatgen.com', 
  true
) ON CONFLICT (id) DO NOTHING;

-- 2. Create some Staff
INSERT INTO public.hospital_staff (id, hospital_id, name, email, role, department, status, avatar)
VALUES 
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Dr. Sarah Smith', 'sarah.s@sehatgen.com', 'Senior Doctor', 'Emergency', 'On Duty', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Nurse Michael Brown', 'michael.b@sehatgen.com', 'Charge Nurse', 'Pediatrics', 'On Duty', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Dr. David Wilson', 'david.w@sehatgen.com', 'Consultant', 'Cardiology', 'Off Duty', 'https://api.dicebear.com/7.x/avataaars/svg?seed=David'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Nurse Elena Rodriguez', 'elena.r@sehatgen.com', 'Staff Nurse', 'ICU', 'On Duty', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Dr. James Taylor', 'james.t@sehatgen.com', 'Resident', 'Radiology', 'On Duty', 'https://api.dicebear.com/7.x/avataaars/svg?seed=James')
ON CONFLICT (email) DO NOTHING;

-- 3. Create Staff Shifts
DO $$ 
DECLARE 
    staff_rec RECORD;
    target_date DATE;
    shift_types TEXT[] := ARRAY['Morning Shift (ER)', 'Evening Shift (Ward)', 'Night Shift (ICU)'];
    s_type TEXT;
BEGIN
    FOR staff_rec IN SELECT id FROM public.hospital_staff LOOP
        FOR i IN -7..7 LOOP
            target_date := CURRENT_DATE + i;
            s_type := shift_types[1 + floor(random() * 3)::int];
            
            INSERT INTO public.staff_shifts (hospital_id, staff_id, shift_date, shift_type, start_time, end_time)
            VALUES (
                '11111111-1111-1111-1111-111111111111',
                staff_rec.id,
                target_date,
                s_type,
                CASE WHEN s_type LIKE 'Morning%' THEN '06:00'::TIME WHEN s_type LIKE 'Evening%' THEN '14:00'::TIME ELSE '22:00'::TIME END,
                CASE WHEN s_type LIKE 'Morning%' THEN '14:00'::TIME WHEN s_type LIKE 'Evening%' THEN '22:00'::TIME ELSE '06:00'::TIME END
            ) ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- 4. Create Patients
DO $$
DECLARE
    p_id UUID;
    full_names TEXT[] := ARRAY['John Doe', 'Jane Doe', 'Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Emma Davis', 'Frank Miller', 'Grace Wilson', 'Henry Moore', 'Ivy Taylor'];
    gender TEXT[] := ARRAY['Male', 'Female', 'Other'];
    blood_groups TEXT[] := ARRAY['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
BEGIN
    FOR i IN 1..30 LOOP
        p_id := gen_random_uuid();
        
        -- Insert into profiles using TEXT role to avoid enum cast errors
        INSERT INTO public.profiles (id, role, full_name, email, created_at)
        VALUES (p_id, 'patient'::user_role, full_names[1 + floor(random() * 10)::int] || ' ' || i, 'patient' || i || '@example.com', NOW() - (random() * interval '30 days'))
        ON CONFLICT (email) DO NOTHING;
        
        SELECT id INTO p_id FROM public.profiles WHERE email = 'patient' || i || '@example.com';

        INSERT INTO public.patients (id, date_of_birth, gender, blood_group, medical_history_summary)
        VALUES (
            p_id, 
            '1970-01-01'::DATE + (random() * interval '40 years'), 
            gender[1 + floor(random() * 3)::int], 
            blood_groups[1 + floor(random() * 8)::int],
            'Sample medical history for patient ' || i
        ) ON CONFLICT (id) DO NOTHING;
    END LOOP;
END $$;

-- 5. Create Escalations
DO $$
DECLARE
    patient_rec RECORD;
    -- Use TEXT[] and cast inside insert to be safe
    severities TEXT[] := ARRAY['low', 'medium', 'high', 'critical'];
    risks TEXT[] := ARRAY['Elevated Heart Rate', 'Low Oxygen Saturation', 'Sepsis Risk Detected', 'Abnormal Lab Results', 'Respiratory Distress'];
BEGIN
    FOR patient_rec IN SELECT id FROM public.patients LIMIT 15 LOOP
        INSERT INTO public.escalations (external_id, patient_id, risk, agent_responsible, severity, created_at)
        VALUES (
            '#PX-' || floor(1000 + random() * 9000)::text,
            patient_rec.id,
            risks[1 + floor(random() * 5)::int],
            'SehatAI Clinical Agent',
            (severities[1 + floor(random() * 4)::int])::escalation_severity,
            NOW() - (random() * interval '7 days')
        ) ON CONFLICT (external_id) DO NOTHING;
    END LOOP;
END $$;

-- 6. Create Medicines
CREATE TABLE IF NOT EXISTS public.medicines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    stock_level INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 50,
    burn_rate FLOAT DEFAULT 0.0,
    unit TEXT DEFAULT 'units',
    status TEXT DEFAULT 'available',
    last_restocked TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.medicines (hospital_id, name, category, stock_level, min_stock, burn_rate, unit)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Paracetamol 500mg', 'Analgesic', 450, 100, 15.5, 'tablets'),
    ('11111111-1111-1111-1111-111111111111', 'Amoxicillin 250mg', 'Antibiotic', 120, 50, 8.2, 'capsules'),
    ('11111111-1111-1111-1111-111111111111', 'Insulin Glargine', 'Diabetes', 45, 20, 3.1, 'vials'),
    ('11111111-1111-1111-1111-111111111111', 'Atorvastatin 20mg', 'Cardiovascular', 85, 30, 5.5, 'tablets'),
    ('11111111-1111-1111-1111-111111111111', 'Salbutamol Inhaler', 'Respiratory', 30, 25, 2.4, 'units'),
    ('11111111-1111-1111-1111-111111111111', 'Metformin 500mg', 'Diabetes', 300, 100, 12.0, 'tablets'),
    ('11111111-1111-1111-1111-111111111111', 'Amlodipine 5mg', 'Cardiovascular', 150, 50, 6.7, 'tablets')
ON CONFLICT DO NOTHING;

-- 7. RESTORE CONSTRAINTS
SET session_replication_role = 'origin';

-- ==============================================================================
-- End of Seed Script
-- ==============================================================================
