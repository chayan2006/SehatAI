/**
 * supabaseService.js — Central Supabase bridge for all 3 portals.
 * Patient → Doctor → Admin data flows through these helpers.
 * This file replaces firestoreService.js
 */
import { supabase } from './supabaseClient.js';

// ─── Users ────────────────────────────────────────────────────────────────────
export async function getAllUsers() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error("Supabase Error (getAllUsers):", error);
    return [];
  }
  return data || [];
}

export async function getUserById(uid) {
  const { data, error } = await supabase.from('users').select('*').eq('id', uid).single();
  if (error) return null;
  return data;
}

export async function updateUserProfile(uid, fields) {
  const { error } = await supabase
    .from('users')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', uid);
  if (error) console.error("Update Profile Error:", error);
}

// ─── Patients ─────────────────────────────────────────────────────────────────
export async function getPatients() {
  const { data, error } = await supabase.from('users').select('*').eq('role', 'patient');
  if (error) return [];
  return data || [];
}

export async function getDoctors() {
  const { data, error } = await supabase.from('users').select('*').eq('role', 'doctor');
  if (error) return [];
  return data || [];
}

// ─── Appointments ─────────────────────────────────────────────────────────────
export async function getAppointments(uid) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_uid', uid)
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) return [];
  return data || [];
}

export async function getAllAppointments() {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) return [];
  return data || [];
}

export async function createAppointment(appointmentData) {
  const { data, error } = await supabase
    .from('appointments')
    .insert([{ ...appointmentData, status: 'pending' }])
    .select('id')
    .single();
  if (error) {
    console.error("Create Appointment Error:", error);
    return null;
  }
  return data?.id;
}

// ─── Notifications ────────────────────────────────────────────────────────────
export async function sendNotificationToUser(toUid, title, message, fromRole = 'System') {
  const { error } = await supabase
    .from('notifications')
    .insert([{
      user_uid: toUid,
      title,
      message,
      from_role: fromRole,
      is_read: false
    }]);
  if (error) console.error("Send Notification Error:", error);
}

export async function getNotificationsForUser(uid) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_uid', uid)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) return [];
  return data || [];
}

export async function markNotificationRead(notifId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notifId);
  if (error) console.error("Mark Read Error:", error);
}

// ─── Hospital Stats ───────────────────────────────────────────────────────────
export async function getHospitalStats() {
  // Using exact counts for large tables isn't ideal, but fine for prototype.
  const [
    { count: totalPatients },
    { count: totalDoctors },
    { count: totalAppointments },
    { count: pendingAppointments }
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'patient'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'doctor'),
    supabase.from('appointments').select('*', { count: 'exact', head: true }),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  return {
    totalPatients: totalPatients || 0,
    totalDoctors: totalDoctors || 0,
    totalAppointments: totalAppointments || 0,
    pendingAppointments: pendingAppointments || 0,
  };
}
