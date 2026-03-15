import { supabase } from './supabaseClient';

export const pharmacyService = {
  async getInventory(hospitalId) {
    const { data, error } = await supabase
      .from('pharmacy_inventory')
      .select('*')
      .eq('hospital_id', hospitalId)
      .order('name', { ascending: true });
    if (error) throw error;
    return data;
  },

  async addDrug(drugData) {
    const { data, error } = await supabase
      .from('pharmacy_inventory')
      .insert([drugData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getPrescriptions(hospitalId) {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*, patients(full_name), profiles!doctor_id(full_name)')
      .eq('hospital_id', hospitalId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async updatePrescriptionStatus(prescriptionId, status) {
    const { data, error } = await supabase
      .from('prescriptions')
      .update({ status: status })
      .eq('id', prescriptionId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async logDispensing(logData) {
    const { data, error } = await supabase
      .from('dispensing_logs')
      .insert([logData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getDispensingLogs(hospitalId) {
    const { data, error } = await supabase
      .from('dispensing_logs')
      .select('*, patients(full_name)')
      .eq('hospital_id', hospitalId)
      .order('dispensed_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};
