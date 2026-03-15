-- ==============================================================================
-- SehatAI Migration V2: Pharmacy, Billing, and Ward Persistence
-- This script adds the missing tables for Level 3 Functionality.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PHARMACY MODULE
-- ------------------------------------------------------------------------------

-- Inventory Table
CREATE TABLE IF NOT EXISTS public.pharmacy_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  category TEXT,
  stock_level INTEGER DEFAULT 0, -- 0 to 100
  status TEXT DEFAULT 'In Stock',
  expiry_date DATE,
  price DECIMAL(10,2) DEFAULT 0.00,
  burn_rate DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prescriptions Table (Queue)
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  drug_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  status TEXT DEFAULT 'Pending', -- Pending, Ready, Rejected, Dispensed
  priority TEXT DEFAULT 'Normal',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dispensing Logs
CREATE TABLE IF NOT EXISTS public.dispensing_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  drug_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  dispensed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  dispensed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. BILLING MODULE
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.billing_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL, -- e.g. INV-0041
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'Pending', -- Paid, Pending, Partial, Overdue, Refunded
  insurance_provider TEXT,
  services_rendered TEXT,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. WARD & BED MANAGEMENT
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.wards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. "ICU-A", "Ward-2"
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.beds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ward_id UUID REFERENCES public.wards(id) ON DELETE CASCADE,
  bed_number TEXT NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'Available', -- Available, Occupied, Cleaning, Maintenance
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. VITALS HISTORY
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.vital_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  heart_rate INTEGER,
  spo2 INTEGER,
  blood_pressure TEXT,
  temperature DECIMAL(4,1),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. ACCESS POLICIES (RLS)
-- ------------------------------------------------------------------------------

-- Enable RLS for all new tables
ALTER TABLE public.pharmacy_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispensing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vital_readings ENABLE ROW LEVEL SECURITY;

-- Shared Doctor/Admin Access Policy (Simplified for demo)
-- In production, we would check hospital_id match
CREATE POLICY "Medical staff full access" ON public.pharmacy_inventory FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin')));
CREATE POLICY "Medical staff full access" ON public.prescriptions FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin')));
CREATE POLICY "Medical staff full access" ON public.dispensing_logs FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin')));
CREATE POLICY "Medical staff full access" ON public.billing_records FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin')));
CREATE POLICY "Medical staff full access" ON public.wards FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin')));
CREATE POLICY "Medical staff full access" ON public.beds FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin')));
CREATE POLICY "Medical staff full access" ON public.vital_readings FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin')));

-- Patient Read Access
CREATE POLICY "Patients view own prescriptions" ON public.prescriptions FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Patients view own bills" ON public.billing_records FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Patients view own vitals" ON public.vital_readings FOR SELECT USING (auth.uid() = patient_id);

-- ------------------------------------------------------------------------------
-- 6. TIMESTAMPS AUTOMATION
-- ------------------------------------------------------------------------------

-- We reuse the update_escalation_timestamp function if it exists, otherwise define it.
-- (Assumed to exist from previous enterprise schema)

CREATE TRIGGER update_pharmacy_ts BEFORE UPDATE ON public.pharmacy_inventory FOR EACH ROW EXECUTE PROCEDURE public.update_escalation_timestamp();
CREATE TRIGGER update_prescriptions_ts BEFORE UPDATE ON public.prescriptions FOR EACH ROW EXECUTE PROCEDURE public.update_escalation_timestamp();
CREATE TRIGGER update_billing_ts BEFORE UPDATE ON public.billing_records FOR EACH ROW EXECUTE PROCEDURE public.update_escalation_timestamp();
CREATE TRIGGER update_beds_ts BEFORE UPDATE ON public.beds FOR EACH ROW EXECUTE PROCEDURE public.update_escalation_timestamp();
