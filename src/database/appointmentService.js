import { supabase } from './supabaseClient';

export const appointmentService = {
  async getPatientAppointments(patientId) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, hospitals(hospital_name, address), hospital_staff(name, role)')
      .eq('patient_id', patientId)
      .order('appointment_time', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async createAppointment(appointmentData) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select();
    
    if (error) throw error;
    return data?.[0];
  },

  async updateAppointmentStatus(appointmentId, status) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId)
      .select();
    
    if (error) throw error;
    return data?.[0];
  }
};
