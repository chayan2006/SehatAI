import { supabase } from './supabaseClient';

export const triageService = {
  async getTriageRecords(hospitalId) {
    const { data, error } = await supabase
      .from('triage_records')
      .select('*')
      .eq('hospital_id', hospitalId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data || [];
  },

  async addTriageRecord(recordData) {
    const { data, error } = await supabase
      .from('triage_records')
      .insert([recordData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateTriageStatus(recordId, status, notes = null) {
    const update = { status };
    if (notes) update.notes = notes;
    if (status === 'Discharged' || status === 'Transferred') update.resolved_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('triage_records')
      .update(update)
      .eq('id', recordId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  subscribeToTriage(hospitalId, callback) {
    return supabase
      .channel(`triage_${hospitalId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'triage_records',
        filter: `hospital_id=eq.${hospitalId}`
      }, callback)
      .subscribe();
  }
};
