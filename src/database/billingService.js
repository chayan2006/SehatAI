import { supabase } from './supabaseClient';

export const billingService = {
  async getInvoices(hospitalId) {
    const { data, error } = await supabase
      .from('billing_records')
      .select('*, patients(full_name)')
      .eq('hospital_id', hospitalId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createInvoice(invoiceData) {
    const { data, error } = await supabase
      .from('billing_records')
      .insert([invoiceData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateInvoiceStatus(invoiceId, status) {
    const { data, error } = await supabase
      .from('billing_records')
      .update({ status: status })
      .eq('id', invoiceId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  subscribeToInvoices(hospitalId, callback) {
    return supabase
      .channel('billing_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'billing_records', filter: `hospital_id=eq.${hospitalId}` },
        callback
      )
      .subscribe();
  }
};
