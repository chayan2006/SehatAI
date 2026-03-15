import { supabase } from './supabaseClient';

export const chatService = {
  async createChatSession(userId, patientId = null, title = 'New Consultation') {
    const { data, error } = await supabase
      .from('ai_chat_sessions')
      .insert([{ user_id: userId, patient_id: patientId, title: title }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getChatHistory(sessionId) {
    const { data, error } = await supabase
      .from('ai_chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async saveChatMessage(sessionId, role, content) {
    const { data, error } = await supabase
      .from('ai_chat_messages')
      .insert([{ session_id: sessionId, role: role, content: content }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getAdminChats(adminId) {
    const { data, error } = await supabase
      .from('admin_chats')
      .select('*')
      .eq('admin_id', adminId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async addAdminChat(adminId, role, text) {
    const { data, error } = await supabase
      .from('admin_chats')
      .insert([{ admin_id: adminId, role, text }])
      .select();
    if (error) throw error;
    return data;
  },

  subscribeToAdminChats(adminId, callback) {
    return supabase
      .channel('admin_chats_sync')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'admin_chats', filter: `admin_id=eq.${adminId}` },
        callback
      )
      .subscribe();
  }
};
