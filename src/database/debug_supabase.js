
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log("Starting Debug...");
    
    // 1. Try to fetch a profile
    console.log("Checking profiles...");
    const { data: pData, error: pError } = await supabase.from('profiles').select('*').limit(1);
    if (pError) console.error("Profiles Error:", pError.message);
    else console.log("Profiles Table OK");

    // 2. Try to fetch vital_readings
    console.log("Checking vital_readings...");
    const { data: vData, error: vError } = await supabase.from('vital_readings').select('*').limit(1);
    if (vError) console.error("Vital Readings Error:", vError.message);
    else console.log("Vital Readings Table OK");

    // 3. Try to add a test patient
    console.log("Attempting test insertion into profiles...");
    const testUid = crypto.randomUUID();
    const { error: insError } = await supabase.from('profiles').insert({
        id: testUid,
        full_name: 'Debug Master Test',
        email: 'debug@test.local',
        role: 'patient'
    });
    
    if (insError) {
        console.error("Insertion Failed:", insError.message);
    } else {
        console.log("Insertion into 'profiles' Succeeded!");
    }
}

debug();
