import { supabase } from './supabaseClient';

export const appointmentService = {
  // Hospital side: get all appointments for this hospital
  async getHospitalAppointments(hospitalId, status = null) {
    let query = supabase
      .from('appointments')
      .select('*, patients(full_name, phone_number)')
      .eq('hospital_id', hospitalId)
      .order('appointment_time', { ascending: true }); // Switched to appointment_time

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Patient side: create a new appointment
  async createAppointment(appointmentData) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select();
    if (error) throw error;
    return data?.[0];
  },

  // Hospital: approve appointment
  async approveAppointment(appointmentId, doctorName = null) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'scheduled', doctor_name: doctorName, updated_at: new Date().toISOString() })
      .eq('id', appointmentId)
      .select();
    if (error) throw error;
    return data?.[0];
  },

  // Hospital: reject appointment
  async rejectAppointment(appointmentId, reason = null) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled', notes: reason, updated_at: new Date().toISOString() })
      .eq('id', appointmentId)
      .select();
    if (error) throw error;
    return data?.[0];
  },

  // Hospital: complete appointment
  async completeAppointment(appointmentId) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', appointmentId)
      .select();
    if (error) throw error;
    return data?.[0];
  },

  // Stats for the appointments page
  async getAppointmentStats(hospitalId) {
    const { data, error } = await supabase
      .from('appointments')
      .select('status')
      .eq('hospital_id', hospitalId);
    if (error) throw error;

    const all = data || [];
    return {
      total:     all.length,
      pending:   all.filter(a => a.status === 'pending' || !a.status).length,
      scheduled: all.filter(a => a.status === 'scheduled').length,
      completed: all.filter(a => a.status === 'completed').length,
      cancelled: all.filter(a => a.status === 'cancelled').length,
    };
  },

  subscribeToAppointments(hospitalId, callback) {
    return supabase
      .channel(`appointments_${hospitalId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter: `hospital_id=eq.${hospitalId}`
      }, callback)
      .subscribe();
  }
};
