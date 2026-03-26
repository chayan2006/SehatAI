/**
 * AuthContext — Firebase implementation.
 *
 * Provides the logged-in user across all 3 portals using Firebase Auth
 * and Firestore for extended user data.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { supabase } from '@/database/supabaseClient';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut 
} from 'firebase/auth';
import { messaging } from '@/lib/firebase';
import { getToken } from 'firebase/messaging';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null); // Extended user object from Firestore
  const [token, setToken]     = useState(null); // Firebase user UID
  const [loading, setLoading] = useState(true);

  // Rehydrate session automatically via Firebase listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch extended role/name from Firestore
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          let userData = null;
          if (docSnap.exists()) {
            const data = docSnap.data();
            userData = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              role: data.role,
              full_name: data.full_name,
              phone: data.phone || '',
              avatar_url: data.avatar_url || null,
              hospital_id: data.hospital_id || null,
              primaryHospitalId: data.primaryHospitalId || null
            };
            setUser(userData);
          } else {
            // Document doesn't exist yet (could be race condition during signup)
            // We set a minimal user object but DON'T default the role to patient immediately
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              role: 'loading', 
              full_name: firebaseUser.displayName || 'Authenticating...',
              is_new_user: true
            });
          }

          setToken(firebaseUser.uid);

          // Request Notification Permission and Store Token
          requestNotificationPermission(firebaseUser.uid);

        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * login — authenticates with Firebase Auth.
   * Note: We don't return the extended user immediately here; 
   * the onAuthStateChanged listener handles population.
   */
  const login = async (email, password, expectedRole) => {
    // 1. Log into Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    
    // 2. Log into Supabase Auth (Sync)
    try {
      await supabase.auth.signInWithPassword({ email, password });
    } catch (err) {
      console.warn("Supabase login failed, but Firebase succeeded:", err.message);
    }

    // 3. Fetch role to ensure they are logging into the correct portal
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      const actualRole = docSnap.data().role;
      if (expectedRole && actualRole !== expectedRole) {
        // Sign them out immediately if wrong portal
        await signOut(auth);
        await supabase.auth.signOut();
        throw new Error('Wrong portal for this account');
      }
    } else {
      throw new Error('User profile missing in database');
    }
    
    // Auth state listener handles setUser
    return userCredential.user;
  };

  /**
   * loginWithGoogle — authenticates with Google.
   * If the user is new, we create their Firestore profile with the expected role.
   */
  const loginWithGoogle = async (expectedRole, extraData = {}) => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const firebaseUser = userCredential.user;
    
    // Check if Firestore profile exists
    const docRef = doc(db, 'users', firebaseUser.uid);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      // New user via Google — create their profile
      const role = expectedRole || 'patient'; 
      const newUserData = {
        email: firebaseUser.email,
        role: role,
        full_name: extraData.full_name || firebaseUser.displayName || 'Google User',
        phone: firebaseUser.phoneNumber || '',
        avatar_url: firebaseUser.photoURL || null,
        created_at: new Date().toISOString(),
        ...extraData
      };
      await setDoc(docRef, newUserData);

      // Create portal-specific collections
      if (role === 'patient') {
        await setDoc(doc(db, 'patients', firebaseUser.uid), { user_id: firebaseUser.uid });
      } else if (role === 'doctor') {
        await setDoc(doc(db, 'doctors', firebaseUser.uid), { user_id: firebaseUser.uid, is_available: true });
      }

      // Explicitly set user state to avoid race condition with listener
      setUser({ id: firebaseUser.uid, ...newUserData });
    } else {
      // Existing user — verify role matches the portal
      const actualRole = docSnap.data().role;
      if (expectedRole && actualRole !== expectedRole) {
        await signOut(auth);
        throw new Error(`This Google account is registered as a ${actualRole}. Please use the correct portal.`);
      }
      setUser({ id: firebaseUser.uid, email: firebaseUser.email, ...docSnap.data() });
    }
    
    return firebaseUser;
  };

  /**
   * register — creates Firebase Auth user AND Firestore user document
   */
  const register = async ({ email, password, role, full_name, phone, institution, ...extra }) => {
    // 1. Create Auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUid = userCredential.user.uid;
    
    // 2. Create Supabase Auth account (Sync)
    const { data: supabaseAuth, error: supabaseError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role,
          phone,
          hospital_name: institution
        }
      }
    });

    if (supabaseError) {
      console.warn("Supabase registration failed, but Firebase succeeded:", supabaseError.message);
    }

    const supabaseUid = supabaseAuth?.user?.id;

    // 3. Create extended profile in Firestore 'users' collection
    await setDoc(doc(db, 'users', firebaseUid), {
      email,
      role,
      full_name,
      phone: phone || '',
      institution: institution || '',
      supabase_uid: supabaseUid || null,
      ...extra,
      created_at: new Date().toISOString()
    });

    // 4. Create extended profile in Supabase tables (Sync)
    if (supabaseUid) {
      try {
        // The profiles table might be handled by a trigger, but manual upsert ensures consistency
        await supabase.from('profiles').upsert({
          id: supabaseUid,
          email,
          role,
          full_name,
          phone_number: phone || '',
          hospital_name: role === 'doctor' || role === 'admin' ? (institution || full_name) : null,
          firebase_uid: firebaseUid
        });

        // Portal-specific records in Supabase
        if (role === 'patient') {
          await supabase.from('patients').upsert({ 
            id: supabaseUid,
            full_name: full_name
          });
        } else if (role === 'doctor') {
          // Trigger might create hospital, but we ensure the doctor record exists
          await supabase.from('hospitals').upsert({ 
            admin_id: supabaseUid,
            hospital_name: institution || full_name,
            contact_email: email 
          });
        } else if (role === 'admin' && institution) {
          await supabase.from('hospitals').upsert({ 
            admin_id: supabaseUid,
            hospital_name: institution,
            contact_email: email 
          });
        }
      } catch (err) {
        console.error("Error creating Supabase profile records:", err);
      }
    }

    // 5. Create portal-specific collections in Firestore
    if (role === 'patient') {
      await setDoc(doc(db, 'patients', firebaseUid), { user_id: firebaseUid });
    } else if (role === 'doctor') {
      await setDoc(doc(db, 'doctors', firebaseUid), { user_id: firebaseUid, is_available: true });
    }

    // 6. Explicitly set user state to ensure the app reacts to the correct role immediately
    const finalUserData = {
      id: firebaseUid,
      email,
      role,
      full_name,
      phone: phone || '',
      institution: institution || '',
      supabase_uid: supabaseUid || null,
      is_new_user: false
    };
    
    console.log("Registration complete. Setting user state:", finalUserData.role);
    setUser(finalUserData);

    return userCredential.user;
  };

  const logout = async () => {
    await signOut(auth);
    await supabase.auth.signOut();
    setUser(null);
    setToken(null);
  };

  /**
   * requestNotificationPermission — asks browser for permission
   * and saves the FCM token to Firestore.
   */
  const requestNotificationPermission = async (uid) => {
    if (!messaging) return;
    
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const fcmToken = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
        });
        
        if (fcmToken) {
          console.log('FCM Token generated:', fcmToken);
          // Save to user profile in Firestore
          await updateDoc(doc(db, 'users', uid), {
            fcm_token: fcmToken,
            last_token_update: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error getting notification permission:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
