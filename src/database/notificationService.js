import { supabase } from './supabaseClient';

export const notificationService = {
  async getMyNotifications(hospitalId, userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`hospital_id.eq.${hospitalId},user_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data || [];
  },

  async getUnreadCount(userId) {
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) return 0;
    return count || 0;
  },

  async markAsRead(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    if (error) throw error;
  },

  async markAllRead(userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) throw error;
  },

  async push(hospitalId, userId, type, title, message, sourceTable = null, sourceId = null) {
    const { error } = await supabase
      .from('notifications')
      .insert([{ hospital_id: hospitalId, user_id: userId, type, title, message, source_table: sourceTable, source_id: sourceId }]);
    if (error) console.error('Notification push failed:', error);
  },

  subscribeToNotifications(userId, callback) {
    return supabase
      .channel(`notifications_${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }
};
