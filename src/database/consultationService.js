import { supabase } from './supabaseClient';

export const consultationService = {
  async getConsultations(hospitalId) {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('hospital_id', hospitalId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data || [];
  },

  async createConsultation(consultationData) {
    const { data, error } = await supabase
      .from('consultations')
      .insert([consultationData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateConsultation(consultationId, updates) {
    const { data, error } = await supabase
      .from('consultations')
      .update(updates)
      .eq('id', consultationId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  subscribeToConsultations(hospitalId, callback) {
    return supabase
      .channel(`consultations_${hospitalId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'consultations',
        filter: `hospital_id=eq.${hospitalId}`
      }, callback)
      .subscribe();
  }
};
