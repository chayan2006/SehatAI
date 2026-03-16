-- ==============================================================================
-- SehatAI: Elite Security & RLS Hardening
-- ==============================================================================

-- 1. Ensure Isolation Columns Exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patients' AND column_name='hospital_id') THEN
        ALTER TABLE public.patients ADD COLUMN hospital_id UUID REFERENCES public.hospitals(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='medical_records' AND column_name='hospital_id') THEN
        ALTER TABLE public.medical_records ADD COLUMN hospital_id UUID REFERENCES public.hospitals(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='escalations' AND column_name='hospital_id') THEN
        ALTER TABLE public.escalations ADD COLUMN hospital_id UUID REFERENCES public.hospitals(id);
    END IF;
END $$;

-- 2. Helper Function to get User Hospital ID
CREATE OR REPLACE FUNCTION public.get_user_hospital_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT hospital_id 
    FROM public.hospital_staff 
    WHERE doctor_id = auth.uid() 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Patients Table RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Isolated Hospital Patient Access"
ON public.patients FOR SELECT
USING (
  auth.uid() = id -- Patient viewing own profile
  OR 
  hospital_id = public.get_user_hospital_id() -- Doctor/Admin viewing hospital patients
);

-- 3. Medical Records RLS
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Isolated Hospital Record Access"
ON public.medical_records FOR SELECT
USING (
  patient_id = auth.uid() -- Patient viewing own records
  OR
  EXISTS (
    SELECT 1 FROM public.patients 
    WHERE id = medical_records.patient_id 
    AND hospital_id = public.get_user_hospital_id()
  )
);

-- 4. Escalations RLS
ALTER TABLE public.escalations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Isolated Hospital Escalation Access"
ON public.escalations FOR ALL
USING (
  hospital_id = public.get_user_hospital_id()
);

-- 5. Audit Logging Trigger (HIPAA Compliance)
CREATE OR REPLACE FUNCTION public.audit_medical_record_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, table_affected, record_id, timestamp)
  VALUES (
    auth.uid(),
    TG_OP || '_MEDICAL_RECORD',
    'medical_records',
    COALESCE(NEW.id, OLD.id),
    NOW()
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_med_record ON public.medical_records;
CREATE TRIGGER audit_med_record
AFTER INSERT OR UPDATE OR DELETE ON public.medical_records
FOR EACH ROW EXECUTE PROCEDURE public.audit_medical_record_change();
