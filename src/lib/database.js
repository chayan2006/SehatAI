import { supabase } from '@/database/supabaseClient';

/**
 * SehatAI Database Utility
 * Connects to Supabase PostgreSQL for real-time data orchestration.
 */

/**
 * Executes a query against Supabase.
 * This is a wrapper to provide a similar interface to the old query utility.
 */
export const query = async (text, params = []) => {
    console.log('Executing Supabase Query:', text, params);

    // Dynamic mapping of old SQL-style queries to Supabase logic
    if (text.includes('SELECT * FROM patients')) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'patient');
        
        if (error) throw error;
        return { rows: data, rowCount: data.length };
    }

    if (text.includes('SELECT count(*) FROM beds')) {
        const { count, error } = await supabase
            .from('hospitals')
            .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        return { rows: [{ count: count.toString() }], rowCount: 1 };
    }

    // Default Fallback: Use direct RPC or raw query if supported, 
    // but in most cases we should use Supabase specific methods.
    // For now, we return mock if query is not mapped.
    console.warn('Unhandled SQL query in Supabase wrapper, returning mock:', text);
    return { rows: [], rowCount: 0 };
};

export const db = {
    getPatients: async () => {
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching patients:', error);
            return [];
        }
        return data || [];
    },
    
    getPatientById: async (id) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) {
            console.error('Error fetching patient:', error);
            return null;
        }
        return data;
    },
    
    updatePatientStatus: async (id, status) => {
        // This likely updates medical_records or profiles
        const { data, error } = await supabase
            .from('profiles')
            .update({ status: status })
            .eq('id', id);
        
        if (error) throw error;
        return data;
    },

    getInventory: async (item) => {
        // Assuming inventory table exists or using mock
        return [];
    },

    getBedAvailability: async (ward) => {
        // Mocked or from hospitals table
        return 12;
    },

    logAction: async (agent, action, details) => {
        const { error } = await supabase
            .from('system_logs')
            .insert([{ agent_name: agent, action, details }]);
        
        if (error) console.error('Error logging action:', error);
    },
    
    getStats: async () => {
        const { count: totalPatients } = await supabase
            .from('patients')
            .select('*', { count: 'exact', head: true });

        const { count: activeEmergencies } = await supabase
            .from('patients')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Critical');

        return {
            totalPatients: totalPatients || 0,
            activeEmergencies: activeEmergencies || 0,
            activeAgents: 4,
            systemHealth: 98,
            availableBeds: 112
        };
    }
};
