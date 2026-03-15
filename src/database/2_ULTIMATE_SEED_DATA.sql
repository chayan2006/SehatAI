-- ==============================================================================
-- SEHAT AI: THE ULTIMATE DATA SEED (PHASE 2)
-- ==============================================================================
-- PURPOSE: This script populates all 19+ tables with massive, realistic data.
-- Use this AFTER running 1_SCHEMA_SETUP.sql.
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

-- 9. ROADMAPS & DOMAINS (CRITICAL: FILLING EMPTY SECTIONS)
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
