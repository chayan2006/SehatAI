-- ============================================================
-- SehatAI — Full PostgreSQL Database Schema
-- Run this on your Supabase SQL editor to set up all tables.
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- CORE / SHARED TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
  full_name     VARCHAR(255) NOT NULL,
  phone         VARCHAR(30),
  avatar_url    TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  last_login    TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  type          VARCHAR(30) NOT NULL CHECK (type IN ('appointment', 'emergency', 'medication', 'alert', 'lab_result', 'general')),
  title         VARCHAR(255) NOT NULL,
  message       TEXT NOT NULL,
  is_read       BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_role  VARCHAR(20),
  action      VARCHAR(255) NOT NULL,
  details     JSONB,
  ip_address  VARCHAR(45),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PATIENT PORTAL TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS patients (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                   UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth             DATE,
  blood_type                VARCHAR(5) CHECK (blood_type IN ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  height_cm                 NUMERIC(5,1),
  weight_kg                 NUMERIC(5,1),
  allergies                 TEXT[],
  chronic_conditions        TEXT[],
  emergency_contact_name    VARCHAR(255),
  emergency_contact_phone   VARCHAR(30),
  insurance_provider        VARCHAR(255),
  insurance_id              VARCHAR(100),
  created_at                TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vitals (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id                UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  heart_rate                INTEGER,
  blood_pressure_systolic   INTEGER,
  blood_pressure_diastolic  INTEGER,
  spo2                      NUMERIC(4,1),
  temperature_c             NUMERIC(4,1),
  steps                     INTEGER,
  source                    VARCHAR(20) DEFAULT 'manual' CHECK (source IN ('bracelet', 'manual', 'clinic')),
  recorded_at               TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lab_results (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  ordered_by      UUID REFERENCES users(id) ON DELETE SET NULL,  -- doctor user_id
  test_name       VARCHAR(255) NOT NULL,
  facility        VARCHAR(255),
  result_summary  TEXT,
  status          VARCHAR(20) DEFAULT 'normal' CHECK (status IN ('normal', 'borderline', 'abnormal', 'pending')),
  result_date     DATE,
  pdf_url         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nutrition_logs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  meal_description TEXT NOT NULL,
  calories         NUMERIC(7,1),
  protein_g        NUMERIC(6,1),
  carbs_g          NUMERIC(6,1),
  fat_g            NUMERIC(6,1),
  logged_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- HOSPITAL / DOCTOR PORTAL TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS wards (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100) NOT NULL,
  floor         INTEGER,
  total_beds    INTEGER NOT NULL DEFAULT 0,
  available_beds INTEGER NOT NULL DEFAULT 0,
  type          VARCHAR(30) CHECK (type IN ('ICU', 'ER', 'General', 'Maternity', 'Post-Op', 'Pediatrics')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctors (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  specialization  VARCHAR(100),
  license_number  VARCHAR(100) UNIQUE,
  department      VARCHAR(100),
  ward_id         UUID REFERENCES wards(id) ON DELETE SET NULL,
  shift           VARCHAR(20) DEFAULT 'morning' CHECK (shift IN ('morning', 'evening', 'night')),
  is_available    BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS beds (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ward_id     UUID NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
  bed_number  VARCHAR(20) NOT NULL,
  status      VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
  patient_id  UUID REFERENCES patients(id) ON DELETE SET NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  role        VARCHAR(30) CHECK (role IN ('nurse', 'technician', 'paramedic', 'admin_staff', 'pharmacist')),
  department  VARCHAR(100),
  ward_id     UUID REFERENCES wards(id) ON DELETE SET NULL,
  shift       VARCHAR(20) DEFAULT 'morning' CHECK (shift IN ('morning', 'evening', 'night')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id       UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  scheduled_at    TIMESTAMPTZ NOT NULL,
  duration_mins   INTEGER DEFAULT 30,
  type            VARCHAR(30) DEFAULT 'checkup' CHECK (type IN ('checkup', 'follow-up', 'specialist', 'emergency', 'telehealth')),
  status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled')),
  location        VARCHAR(255),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS triage_cases (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  assigned_doctor_id  UUID REFERENCES doctors(id) ON DELETE SET NULL,
  chief_complaint     TEXT NOT NULL,
  priority            VARCHAR(20) DEFAULT 'moderate' CHECK (priority IN ('critical', 'urgent', 'moderate', 'low')),
  status              VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'in-progress', 'discharged', 'admitted')),
  arrived_at          TIMESTAMPTZ DEFAULT NOW(),
  seen_at             TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS consultations (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id    UUID REFERENCES appointments(id) ON DELETE SET NULL,
  doctor_id         UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id        UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  soap_subjective   TEXT,
  soap_objective    TEXT,
  soap_assessment   TEXT,
  soap_plan         TEXT,
  transcript_text   TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  prescribed_by   UUID REFERENCES doctors(id) ON DELETE SET NULL,
  consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
  name            VARCHAR(255) NOT NULL,
  dosage          VARCHAR(100),
  frequency       VARCHAR(100),
  start_date      DATE,
  end_date        DATE,
  is_active       BOOLEAN DEFAULT TRUE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medication_logs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_id  UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  patient_id     UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  taken_at       TIMESTAMPTZ DEFAULT NOW(),
  status         VARCHAR(20) DEFAULT 'taken' CHECK (status IN ('taken', 'missed', 'skipped'))
);

CREATE TABLE IF NOT EXISTS pharmacy_orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_id    UUID REFERENCES medications(id) ON DELETE SET NULL,
  patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  medication_name  VARCHAR(255) NOT NULL,
  dosage           VARCHAR(100),
  quantity         INTEGER,
  status           VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'dispensed', 'cancelled')),
  dispensed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ambulance_requests (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id            UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  requested_by_doctor   UUID REFERENCES doctors(id) ON DELETE SET NULL,
  pickup_address        TEXT NOT NULL,
  destination           TEXT,
  priority              VARCHAR(20) DEFAULT 'standard' CHECK (priority IN ('critical', 'high', 'standard')),
  status                VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'dispatched', 'en_route', 'arrived', 'completed', 'cancelled')),
  unit_id               VARCHAR(50),
  eta_minutes           INTEGER,
  patient_condition     TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  resolved_at           TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS billing (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id        UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id         UUID REFERENCES doctors(id) ON DELETE SET NULL,
  appointment_id    UUID REFERENCES appointments(id) ON DELETE SET NULL,
  description       TEXT,
  total_amount      NUMERIC(10,2) NOT NULL,
  insurance_covered NUMERIC(10,2) DEFAULT 0,
  status            VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'outstanding', 'waived')),
  issued_at         TIMESTAMPTZ DEFAULT NOW(),
  paid_at           TIMESTAMPTZ
);

-- ============================================================
-- ADMIN PORTAL TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS escalations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id          UUID REFERENCES patients(id) ON DELETE CASCADE,
  detected_by_agent   VARCHAR(100),
  risk_description    TEXT NOT NULL,
  severity            VARCHAR(20) DEFAULT 'warning' CHECK (severity IN ('critical', 'warning', 'info')),
  status              VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'overridden')),
  resolved_by         UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_metrics (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_key    VARCHAR(100) NOT NULL,
  metric_value  NUMERIC,
  recorded_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_agent_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_name      VARCHAR(100) NOT NULL,
  action          VARCHAR(255),
  input_summary   TEXT,
  output_summary  TEXT,
  portal          VARCHAR(20) CHECK (portal IN ('patient', 'doctor', 'admin')),
  duration_ms     INTEGER,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_name           VARCHAR(255) NOT NULL UNIQUE,
  category            VARCHAR(30) CHECK (category IN ('medication', 'equipment', 'blood_supply', 'oxygen', 'consumable')),
  current_stock       NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit                VARCHAR(50),
  reorder_threshold   NUMERIC(10,2),
  last_restocked      TIMESTAMPTZ,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES (for performance)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_vitals_patient_id ON vitals(patient_id);
CREATE INDEX IF NOT EXISTS idx_vitals_recorded_at ON vitals(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_medications_patient_id ON medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_patient_id ON medication_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_escalations_status ON escalations(status);
CREATE INDEX IF NOT EXISTS idx_escalations_severity ON escalations(severity);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_system_metrics_key_time ON system_metrics(metric_key, recorded_at DESC);

-- ============================================================
-- TRIGGERS — auto-update ward bed counts
-- ============================================================

CREATE OR REPLACE FUNCTION update_ward_bed_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE wards
  SET available_beds = (
    SELECT COUNT(*) FROM beds WHERE ward_id = COALESCE(NEW.ward_id, OLD.ward_id) AND status = 'available'
  )
  WHERE id = COALESCE(NEW.ward_id, OLD.ward_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_ward_beds ON beds;
CREATE TRIGGER trg_update_ward_beds
AFTER INSERT OR UPDATE OR DELETE ON beds
FOR EACH ROW EXECUTE FUNCTION update_ward_bed_count();

-- ============================================================
-- SEED DATA (Initial Wards)
-- ============================================================

INSERT INTO wards (name, floor, total_beds, available_beds, type) VALUES
  ('ICU Wing A',        3, 20, 12, 'ICU'),
  ('Emergency Room',    1, 30,  5, 'ER'),
  ('General Ward 1',    2, 50, 32, 'General'),
  ('General Ward 2',    2, 50, 28, 'General'),
  ('Maternity Wing',    4, 20, 14, 'Maternity'),
  ('Post-Op Recovery',  3, 15,  8, 'Post-Op'),
  ('Pediatrics Wing',   4, 25, 18, 'Pediatrics')
ON CONFLICT DO NOTHING;

INSERT INTO inventory (item_name, category, current_stock, unit, reorder_threshold) VALUES
  ('O-Negative Blood', 'blood_supply', 12, 'units', 20),
  ('O-Positive Blood',  'blood_supply', 45, 'units', 30),
  ('Oxygen Cylinders',  'oxygen',       80, 'units', 20),
  ('Saline 1L',         'consumable',   400, 'bags',  100),
  ('Morphine 10mg',     'medication',   200, 'vials', 50),
  ('Epinephrine 1mg',   'medication',   150, 'vials', 40),
  ('Defibrillator',     'equipment',    8,  'units',  2),
  ('Ventilator',        'equipment',    12, 'units',  3)
ON CONFLICT DO NOTHING;
