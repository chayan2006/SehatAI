import { supabase } from './supabaseClient';

export const domainService = {
  // Example: Fetch all health domains or categories
  async getDomains() {
    const { data, error } = await supabase
      .from('domains')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  // Example: Get specific domain details
  async getDomainById(domainId) {
    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .eq('id', domainId)
      .single();
    
    if (error) throw error;
    return data;
  }
};
