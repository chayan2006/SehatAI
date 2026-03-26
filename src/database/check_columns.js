
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

async function checkColumns() {
    console.log("Checking Columns for 'users'...");
    const { data: userData, error: userError } = await supabase.from('users').select('*').limit(1);
    if (userData && userData.length > 0) {
        console.log("Users Columns:", Object.keys(userData[0]));
    } else {
        console.log("Users table is empty or unreadable.");
    }

    console.log("Checking Columns for 'patients'...");
    const { data: ptData, error: ptError } = await supabase.from('patients').select('*').limit(1);
    if (ptData && ptData.length > 0) {
        console.log("Patients Columns:", Object.keys(ptData[0]));
    } else {
        console.log("Patients table is empty or unreadable.");
    }
}

checkColumns();
