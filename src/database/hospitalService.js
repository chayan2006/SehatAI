import { supabase } from './supabaseClient';

export const hospitalService = {
  async getEscalations(hospitalId) {
    const { data, error } = await supabase
      .from('escalations')
      .select('*, patients(full_name)')
      .eq('hospital_id', hospitalId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createEscalation(escalationData) {
    const { data, error } = await supabase
      .from('escalations')
      .insert([escalationData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async resolveEscalation(escalationId, overrideNotes) {
    const { data, error } = await supabase
      .from('escalations')
      .update({
        resolved: true,
        overridden_at: new Date().toISOString(),
        override_reason: overrideNotes
      })
      .eq('id', escalationId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getWards(hospitalId) {
    const { data, error } = await supabase
      .from('wards')
      .select('*, beds(*)')
      .eq('hospital_id', hospitalId);
    if (error) throw error;
    return data;
  },

  async updateBedStatus(bedId, status, patientId = null) {
    const { data, error } = await supabase
      .from('beds')
      .update({ status: status, patient_id: patientId })
      .eq('id', bedId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getAuditLogs(hospitalId) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data;
  },

  async logAction(userId, action, table = null, recordId = null) {
    const { error } = await supabase
      .from('audit_logs')
      .insert([{ 
        user_id: userId, 
        action: action, 
        table_affected: table, 
        record_id: recordId 
      }]);
    if (error) console.error("Audit log failed:", error);
  },

  async getStaff(hospitalId) {
    const { data, error } = await supabase
      .from('hospital_staff')
      .select('*')
      .eq('hospital_id', hospitalId)
      .order('name', { ascending: true });
    if (error) throw error;
    return data;
  },

  async addStaff(hospitalId, staffData) {
    const { data, error } = await supabase
      .from('hospital_staff')
      .upsert({ ...staffData, hospital_id: hospitalId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteStaff(staffId) {
    const { error } = await supabase
      .from('hospital_staff')
      .delete()
      .eq('id', staffId);
    if (error) throw error;
    return true;
  },

  async getShifts(hospitalId) {
    const { data, error } = await supabase
      .from('staff_shifts')
      .select('*')
      .eq('hospital_id', hospitalId)
      .order('shift_date', { ascending: true });
    if (error) throw error;
    return data;
  },

  async assignShift(hospitalId, shiftData) {
    const { data, error } = await supabase
      .from('staff_shifts')
      .insert([{ ...shiftData, hospital_id: hospitalId }])
      .select();
    if (error) throw error;
    return data;
  },

  async getHospitalByAdmin(adminId) {
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .eq('admin_id', adminId)
      .maybeSingle();
    if (error) throw error;
    return data; // returns null if not found instead of throwing
  },

  async getMyHospital() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return this.getHospitalByAdmin(user.id);
  },

  // Real-time subscriptions
  subscribeToEscalations(hospitalId, callback) {
    return supabase
      .channel('escalations_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'escalations', filter: `hospital_id=eq.${hospitalId}` },
        callback
      )
      .subscribe();
  },

  subscribeToBeds(hospitalId, callback) {
    return supabase
      .channel('beds_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'beds' }, // Filtering nested is complex, but we can filter in callback if needed
        callback
      )
      .subscribe();
  }
};
