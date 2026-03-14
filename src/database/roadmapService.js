import { supabase } from './supabaseClient';

export const roadmapService = {
  // Example: Get roadmap for a specific entity
  async getRoadmap(entityId) {
    const { data, error } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('entity_id', entityId);
    
    if (error) throw error;
    return data;
  },

  // Example: Create a new roadmap entry
  async createRoadmapEntry(entry) {
    const { data, error } = await supabase
      .from('roadmaps')
      .insert([entry]);
    
    if (error) throw error;
    return data;
  }
};
