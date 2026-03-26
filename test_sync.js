import { supabase } from './src/database/supabaseClient.js';
import { hospitalService } from './src/database/hospitalService.js';
import { patientService } from './src/database/patientService.js';
import { billingService } from './src/database/billingService.js';

async function testQueries() {
  console.log("Fetching hospital...");
  try {
    const hospital = await hospitalService.getMyHospital();
    console.log("Hospital ID:", hospital?.id);
    
    if (!hospital) {
        console.log("No hospital found!");
        return;
    }

    console.log("\nTesting getWards...");
    try {
        const wards = await hospitalService.getWards(hospital.id);
        console.log(`Success! Found ${wards.length} wards.`);
    } catch (e) {
        console.error("getWards Error:", e.message);
    }

    console.log("\nTesting getPatients...");
    try {
        const patients = await patientService.getPatients(hospital.id);
        console.log(`Success! Found ${patients.length} patients.`);
    } catch (e) {
        console.error("getPatients Error:", e.message);
    }

    console.log("\nTesting getInvoices...");
    try {
        const invoices = await billingService.getInvoices(hospital.id);
        console.log(`Success! Found ${invoices.length} invoices.`);
    } catch (e) {
        console.error("getInvoices Error:", e.message);
    }

  } catch (e) {
    console.error("Critical Error:", e.message);
  }
}

testQueries();
