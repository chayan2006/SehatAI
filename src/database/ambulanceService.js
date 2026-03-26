import { supabase } from './supabaseClient';

export const ambulanceService = {
  async getDispatches(hospitalId) {
    const { data, error } = await supabase
      .from('ambulance_dispatches')
      .select('*')
      .eq('hospital_id', hospitalId)
      .order('created_at', { ascending: false })
      .limit(30);
    if (error) throw error;
    return data || [];
  },

  async createDispatch(dispatchData) {
    const { data, error } = await supabase
      .from('ambulance_dispatches')
      .insert([{ ...dispatchData, status: 'Dispatched', dispatched_at: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateDispatchStatus(dispatchId, status) {
    const update = { status };
    if (status === 'Completed' || status === 'Cancelled') update.completed_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('ambulance_dispatches')
      .update(update)
      .eq('id', dispatchId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  subscribeToDispatches(hospitalId, callback) {
    return supabase
      .channel(`ambulance_${hospitalId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ambulance_dispatches',
        filter: `hospital_id=eq.${hospitalId}`
      }, callback)
      .subscribe();
  }
};
