import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

// Load .env
const envConfig = dotenv.parse(readFileSync('.env'));
const SUPABASE_URL = envConfig.VITE_SUPABASE_URL;
const SUPABASE_KEY = envConfig.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const MASTER_HOSPITAL_ID = '11111111-1111-1111-1111-111111111111';

async function seed() {
  console.log('--- SEHATING DEMO DATA SEEDING ---');
  
  // 1. Ensure Hospital Exists
  const { data: hospital } = await supabase.from('hospitals').upsert({
    id: MASTER_HOSPITAL_ID,
    hospital_name: 'Metro Sehat Multispecialty',
    location: 'New Delhi, India',
    is_verified: true,
    contact_number: '+91 98765 43210'
  }).select();
  console.log('✓ Hospital Seeded');

  // 2. Seed Patients
  const patients = [
    { id: '22222222-2222-2222-2222-222222222222', hospital_id: MASTER_HOSPITAL_ID, full_name: 'Rahul Sharma', gender: 'Male', age: 45, phone: '9876543211', external_id: 'PX-1001' },
    { id: '33333333-3333-3333-3333-333333333333', hospital_id: MASTER_HOSPITAL_ID, full_name: 'Priya Verma', gender: 'Female', age: 34, phone: '9876543212', external_id: 'PX-1002' },
    { id: '44444444-4444-4444-4444-444444444444', hospital_id: MASTER_HOSPITAL_ID, full_name: 'Anita Desai', gender: 'Female', age: 29, phone: '9876543213', external_id: 'PX-1003' },
    { id: '55555555-5555-5555-5555-555555555555', hospital_id: MASTER_HOSPITAL_ID, full_name: 'Vikram Singh', gender: 'Male', age: 52, phone: '9876543214', external_id: 'PX-1004' }
  ];
  await supabase.from('patients').upsert(patients);
  console.log('✓ Patients Seeded');

  // 3. Seed Pharmacy Inventory
  const inventory = [
    { hospital_id: MASTER_HOSPITAL_ID, name: 'Amoxicillin 500mg', sku: 'AMX-500', stock_level: 85, status: 'In Stock', price: 450, category: 'Antibiotic', expiry_date: '12/2026' },
    { hospital_id: MASTER_HOSPITAL_ID, name: 'Metformin 850mg', sku: 'MET-850', stock_level: 12, status: 'Low Stock', price: 120, category: 'Diabetes', expiry_date: '08/2025' },
    { hospital_id: MASTER_HOSPITAL_ID, name: 'Atorvastatin 20mg', sku: 'ATR-20', stock_level: 60, status: 'In Stock', price: 890, category: 'Cholesterol', expiry_date: '05/2027' },
    { hospital_id: MASTER_HOSPITAL_ID, name: 'Warfarin 5mg', sku: 'WRF-5', stock_level: 40, status: 'In Stock', price: 230, category: 'Anticoagulant', expiry_date: '11/2025' },
    { hospital_id: MASTER_HOSPITAL_ID, name: 'Aspirin 75mg', sku: 'ASP-75', stock_level: 95, status: 'In Stock', price: 50, category: 'Antiplatelet', expiry_date: '01/2028' }
  ];
  await supabase.from('pharmacy_inventory').upsert(inventory);
  console.log('✓ Pharmacy Inventory Seeded');

  // 4. Seed Triage Records
  const triage = [
    { hospital_id: MASTER_HOSPITAL_ID, patient_name: 'Rahul Sharma', complaint: 'Chest pain & shortness of breath', severity: 'Critical', status: 'Waiting', vitals: 'BP: 160/100, SpO2: 92%' },
    { hospital_id: MASTER_HOSPITAL_ID, patient_name: 'Priya Verma', complaint: 'High grade fever & chills', severity: 'Moderate', status: 'In-Progress', vitals: 'Temp: 103F, HR: 110' },
    { hospital_id: MASTER_HOSPITAL_ID, patient_name: 'Anita Desai', complaint: 'Suspected fracture right wrist', severity: 'Urgent', status: 'Waiting', vitals: 'Pain Scale: 8/10' }
  ];
  await supabase.from('triage_records').upsert(triage);
  console.log('✓ Triage Records Seeded');

  // 5. Seed Lab Results
  const labs = [
    { hospital_id: MASTER_HOSPITAL_ID, patient_id: '22222222-2222-2222-2222-222222222222', test_name: 'Troponin T', category: 'Cardiology', status: 'Completed', result_value: '0.15', unit: 'ng/mL', doctor_notes: 'Elevated markers, potential MI.' },
    { hospital_id: MASTER_HOSPITAL_ID, patient_id: '33333333-3333-3333-3333-333333333333', test_name: 'WBC Count', category: 'Pathology', status: 'Completed', result_value: '14.5', unit: 'x10^9/L', doctor_notes: 'Leukocytosis detected.' }
  ];
  await supabase.from('lab_results').upsert(labs);
  console.log('✓ Lab Results Seeded');

  // 6. Seed Wards and Beds
  const { data: wards } = await supabase.from('wards').upsert([
    { hospital_id: MASTER_HOSPITAL_ID, name: 'ICU - West Wing', status: 'active' },
    { hospital_id: MASTER_HOSPITAL_ID, name: 'General Medical - Floor 2', status: 'active' },
    { hospital_id: MASTER_HOSPITAL_ID, name: 'Pediatrics - North', status: 'active' }
  ], { onConflict: 'hospital_id, name' }).select();

  if (wards) {
    const bedsToInsert = [];
    wards.forEach(ward => {
      for (let i = 1; i <= 5; i++) {
        bedsToInsert.push({
          ward_id: ward.id,
          bed_number: `${ward.name[0]}${i}`,
          status: i === 1 ? 'occupied' : 'available',
          hospital_id: MASTER_HOSPITAL_ID
        });
      }
    });
    await supabase.from('beds').upsert(bedsToInsert, { onConflict: 'ward_id, bed_number' });
    console.log('✓ Wards & Beds Seeded');
  }

  // 7. Seed Hospital Staff
  await supabase.from('hospital_staff').upsert([
    { hospital_id: MASTER_HOSPITAL_ID, name: 'Dr. Sarah Mitchell', role: 'Senior Cardiologist', status: 'on_duty' },
    { hospital_id: MASTER_HOSPITAL_ID, name: 'Nurse Jacob', role: 'Head Nurse (ICU)', status: 'on_duty' },
    { hospital_id: MASTER_HOSPITAL_ID, name: 'Dr. Rajesh Khanna', role: 'ER Specialist', status: 'off_duty' }
  ], { onConflict: 'hospital_id, name' });
  console.log('✓ Staff Seeded');

  console.log('--- ALL SYSTEMS GO. DEMO READY. ---');
}

seed().catch(console.error);
