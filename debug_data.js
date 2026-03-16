import { hospitalService, patientService, authService } from './src/database/index.js';
import { supabase } from './src/database/supabaseClient.js';

async function debug() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user logged in');
      return;
    }
    console.log('User ID:', user.id);

    const hospital = await hospitalService.getMyHospital();
    console.log('Hospital Context:', hospital ? { id: hospital.id, name: hospital.hospital_name } : 'None');

    if (hospital) {
      const patients = await patientService.getPatients(hospital.id);
      console.log('Patients count for this hospital:', patients.length);
      if (patients.length > 0) {
        console.log('Sample Patient:', { id: patients[0].id, name: patients[0].full_name, hospital_id: patients[0].hospital_id });
      }

      const allPatients = await supabase.from('patients').select('id, full_name, hospital_id');
      console.log('Total Patients in DB:', allPatients.data?.length);
      console.log('Hospitals in DB:', (await supabase.from('hospitals').select('id, hospital_name, admin_id')).data);
    }
  } catch (err) {
    console.error('Debug failed:', err);
  }
}

debug();
