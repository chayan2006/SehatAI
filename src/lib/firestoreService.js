/**
 * firestoreService.js — Central Firestore bridge for all 3 portals.
 * Patient → Doctor → Admin data flows through these helpers.
 */
import { db } from './firebase.js';
import {
  collection, doc, getDocs, getDoc, setDoc, addDoc,
  query, where, orderBy, limit, updateDoc, serverTimestamp
} from 'firebase/firestore';

// ─── Users ────────────────────────────────────────────────────────────────────
export async function getAllUsers() {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getUserById(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateUserProfile(uid, fields) {
  await updateDoc(doc(db, 'users', uid), { ...fields, updated_at: new Date().toISOString() });
}

// ─── Patients ─────────────────────────────────────────────────────────────────
export async function getPatients() {
  const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'patient')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getDoctors() {
  const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'doctor')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}


// ─── Appointments ─────────────────────────────────────────────────────────────
export async function getAppointments(uid) {
  try {
    const snap = await getDocs(
      query(collection(db, 'appointments'), where('patient_uid', '==', uid), orderBy('created_at', 'desc'), limit(10))
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

export async function getAllAppointments() {
  try {
    const snap = await getDocs(query(collection(db, 'appointments'), orderBy('created_at', 'desc'), limit(50)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

export async function createAppointment(appointmentData) {
  const ref = await addDoc(collection(db, 'appointments'), {
    ...appointmentData,
    created_at: serverTimestamp(),
    status: 'pending'
  });
  return ref.id;
}

// ─── Notifications ────────────────────────────────────────────────────────────
/**
 * Sends a notification to a specific user (visible in their portal notification dropdown).
 * @param {string} toUid - The recipient user's Firebase UID
 * @param {string} title - Notification title
 * @param {string} message - Notification body
 * @param {string} from - Sender label e.g. 'Doctor' or 'Admin'
 */
export async function sendNotificationToUser(toUid, title, message, from = 'System') {
  await addDoc(collection(db, 'notifications'), {
    user_uid: toUid,
    title,
    message,
    from,
    is_read: false,
    created_at: serverTimestamp()
  });
}

export async function getNotificationsForUser(uid) {
  try {
    const snap = await getDocs(
      query(collection(db, 'notifications'), where('user_uid', '==', uid), orderBy('created_at', 'desc'), limit(20))
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

export async function markNotificationRead(notifId) {
  await updateDoc(doc(db, 'notifications', notifId), { is_read: true });
}

// ─── Hospital Stats ───────────────────────────────────────────────────────────
export async function getHospitalStats() {
  const [patients, doctors, appointments] = await Promise.all([
    getPatients(),
    getDoctors(),
    getAllAppointments().catch(() => [])
  ]);
  return {
    totalPatients: patients.length,
    totalDoctors: doctors.length,
    totalAppointments: appointments.length,
    pendingAppointments: appointments.filter(a => a.status === 'pending').length,
  };
}
