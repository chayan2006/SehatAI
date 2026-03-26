/**
 * AuthContext — Firebase implementation.
 *
 * Provides the logged-in user across all 3 portals using Firebase Auth
 * and Firestore for extended user data.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
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
              avatar_url: data.avatar_url || null
            };
          } else {
            userData = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              role: 'patient',
              full_name: 'Unknown User'
            };
          }

          setUser(userData);
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
    
    // 2. Fetch role to ensure they are logging into the correct portal
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      const actualRole = docSnap.data().role;
      if (expectedRole && actualRole !== expectedRole) {
        // Sign them out immediately if wrong portal
        await signOut(auth);
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
  const loginWithGoogle = async (expectedRole) => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const firebaseUser = userCredential.user;
    
    // Check if Firestore profile exists
    const docRef = doc(db, 'users', firebaseUser.uid);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      // New user via Google — create their profile
      const role = expectedRole || 'patient'; // Default to patient if not specified
      await setDoc(docRef, {
        email: firebaseUser.email,
        role: role,
        full_name: firebaseUser.displayName || 'Google User',
        phone: firebaseUser.phoneNumber || '',
        avatar_url: firebaseUser.photoURL || null,
        created_at: new Date().toISOString()
      });

      // Create portal-specific collections
      if (role === 'patient') {
        await setDoc(doc(db, 'patients', firebaseUser.uid), { user_id: firebaseUser.uid });
      } else if (role === 'doctor') {
        await setDoc(doc(db, 'doctors', firebaseUser.uid), { user_id: firebaseUser.uid, is_available: true });
      }
    } else {
      // Existing user — verify role matches the portal
      const actualRole = docSnap.data().role;
      if (expectedRole && actualRole !== expectedRole) {
        await signOut(auth);
        throw new Error(`This Google account is registered as a ${actualRole}. Please use the correct portal.`);
      }
    }
    
    return firebaseUser;
  };

  /**
   * register — creates Firebase Auth user AND Firestore user document
   */
  const register = async ({ email, password, role, full_name, phone, ...extra }) => {
    // 1. Create Auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    
    // 2. Create extended profile in Firestore 'users' collection
    await setDoc(doc(db, 'users', uid), {
      email,
      role,
      full_name,
      phone: phone || '',
      ...extra,
      created_at: new Date().toISOString()
    });

    // 3. (Optional) Create portal-specific collections
    if (role === 'patient') {
      await setDoc(doc(db, 'patients', uid), { user_id: uid });
    } else if (role === 'doctor') {
      await setDoc(doc(db, 'doctors', uid), { user_id: uid, is_available: true });
    }

    // Auth state listener handles setUser
    return userCredential.user;
  };

  const logout = async () => {
    await signOut(auth);
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
