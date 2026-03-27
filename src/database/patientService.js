import { supabase } from './supabaseClient';

export const patientService = {
  async getPatients(hospitalId, page = 0, pageSize = 200) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('hospital_id', hospitalId)
      .order('full_name', { ascending: true })
      .range(from, to);
    if (error) throw error;
    return data;
  },

  async addPatient(patientData) {
    const { data, error } = await supabase
      .from('patients')
      .insert([patientData])
      .select();
    if (error) throw error;
    return data?.[0];
  },

  async updatePatient(patientId, updates) {
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', patientId)
      .select();
    if (error) throw error;
    return data?.[0];
  },

  async deletePatient(patientId) {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', patientId);
    if (error) throw error;
    return true;
  },

  async getLatestVitals(patientId) {
    const { data, error } = await supabase
      .from('vital_readings')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false })
      .limit(10);
    if (error) throw error;
    return data;
  },

  async recordVitals(vitalsData) {
    const { data, error } = await supabase
      .from('vital_readings')
      .insert([vitalsData])
      .select();
    if (error) throw error;
    return data?.[0];
  },

  subscribeToVitals(patientId, callback) {
    return supabase
      .channel(`vitals_${patientId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'vital_readings', filter: `patient_id=eq.${patientId}` },
        callback
      )
      .subscribe();
  },

  async searchPatients(hospitalId, query) {
    if (!query) return [];
    console.log('Searching patients:', query);
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('hospital_id', hospitalId)
      .ilike('full_name', `%${query}%`);
    
    if (error) throw error;
    return data || [];
  },

  async getMedicalRecords(patientId) {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('visit_date', { ascending: false });
    if (error) throw error;
    return data;
  }
};
