import { supabase } from './supabaseClient';

export const labService = {
  async getLabResults(hospitalId) {
    const { data, error } = await supabase
      .from('lab_results')
      .select('*, patients(full_name, external_id)')
      .eq('hospital_id', hospitalId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async orderTab(hospitalId, patientId, testName, category) {
    const { data, error } = await supabase
      .from('lab_results')
      .insert([{
        hospital_id: hospitalId,
        patient_id: patientId,
        test_name: testName,
        category: category,
        status: 'Pending'
      }])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async updateLabResult(resultId, updateData) {
    const { data, error } = await supabase
      .from('lab_results')
      .update({
        ...updateData,
        completed_at: updateData.status === 'Completed' ? new Date().toISOString() : null
      })
      .eq('id', resultId)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async deleteLabResult(resultId) {
    const { error } = await supabase
      .from('lab_results')
      .delete()
      .eq('id', resultId);
    
    if (error) throw error;
    return true;
  }
};
