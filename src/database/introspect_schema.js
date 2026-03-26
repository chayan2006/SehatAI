
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

async function introspect() {
    // We can't use rpc if it's not defined, so let's try to select from a non-existent table 
    // and see if the error message lists suggestions, OR just try common names.
    const commonNames = ['users', 'profiles', 'hospitals', 'patients', 'vitals', 'vital_readings', 'appointments', 'medical_records', 'health_records'];
    
    console.log("Introspecting Tables...");
    for (const name of commonNames) {
        const { error } = await supabase.from(name).select('*').limit(1);
        if (!error) {
            console.log(`[FOUND] ${name}`);
        } else if (error.code !== '42P01' && error.code !== 'PGRST204') {
            // PGRST204/42P01 means table missing. Other codes mean it exists but has a different issue (e.g. RLS)
            console.log(`[EXIST?] ${name} (Error: ${error.code} - ${error.message})`);
        }
    }
}

introspect();
