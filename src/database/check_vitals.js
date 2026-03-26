
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

async function checkVitals() {
    const { data, error } = await supabase.from('vitals').select('*').limit(1);
    if (error) {
        console.error("Vitals Error:", error.message);
    } else {
        console.log("Vitals Table EXISTS");
        if (data.length > 0) {
            console.log("Columns:", Object.keys(data[0]));
        } else {
            // Try to insert a dummy to see if it allows it
            const { error: insError } = await supabase.from('vitals').insert({
                patient_uid: '44444444-4444-4444-4444-444444444444',
                recorded_at: new Date().toISOString(),
                heart_rate: 80,
                blood_pressure: '120/80'
            });
            if (insError) console.error("Insert Vitals Error:", insError.message);
            else console.log("Can insert into vitals with: patient_uid, heart_rate, blood_pressure");
        }
    }
}

checkVitals();
