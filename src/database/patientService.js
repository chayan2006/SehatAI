import { supabase } from './supabaseClient';

export const patientService = {
  async getPatients(hospitalId) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('hospital_id', hospitalId)
      .order('full_name', { ascending: true });
    if (error) throw error;
    return data;
  },

  async addPatient(patientData) {
    const { data, error } = await supabase
      .from('patients')
      .insert([patientData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updatePatient(patientId, updates) {
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', patientId)
      .select()
      .single();
    if (error) throw error;
    return data;
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
      .select()
      .single();
    if (error) throw error;
    return data;
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
  }
};
