import { supabase } from './supabaseClient.js';
import { hospitalService } from './hospitalService.js';
import { patientService } from './patientService.js';

async function debug() {
  console.log('--- SEHAT AI DEBUG START ---');
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    console.log('Current User ID:', user?.id);
    console.log('User Role:', user?.user_metadata?.role);

    const hospital = await hospitalService.getHospitalByAdmin(user.id);
    console.log('Hospital Context:', hospital ? 'Found' : 'NOT FOUND');
    if (!hospital) {
        console.error('ERROR: No hospital found for this admin. This will cause inserts to fail due to hospital_id NULL or FK constraints.');
    } else {
        console.log('Hospital ID:', hospital.id);
    }

    console.log('\n--- Testing Patient Insert ---');
    try {
        const { data, error } = await supabase
            .from('patients')
            .insert([{
                hospital_id: hospital?.id,
                full_name: 'Debug Patient',
                status: 'Stable'
            }]);
        if (error) throw error;
        console.log('Patient Insert Success!');
    } catch (e) {
        console.error('Patient Insert FAILED:', e.message);
        console.error('Error Details:', e);
    }

    console.log('\n--- Testing Staff Insert ---');
    try {
        const { data, error } = await supabase
            .from('hospital_staff')
            .insert([{
                hospital_id: hospital?.id,
                name: 'Debug Staff',
                role: 'Nurse',
                status: 'On Duty'
            }]);
        if (error) throw error;
        console.log('Staff Insert Success!');
    } catch (e) {
        console.error('Staff Insert FAILED:', e.message);
    }

  } catch (err) {
    console.error('General Error:', err.message);
  }
}

debug();
