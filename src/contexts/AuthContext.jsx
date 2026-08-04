import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, limit } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Try to fetch user profile from Firestore
        try {
          const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (profileDoc.exists()) {
            setUserProfile(profileDoc.data());
          } else {
            // Profile doesn't exist yet (new user, pending approval)
            setUserProfile({ role: 'pending', displayName: firebaseUser.email });
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setUserProfile({ role: 'pending', displayName: firebaseUser.email });
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred;
  };

  const register = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    
    // Check if this is the first user
    const usersRef = collection(db, 'users');
    const q = query(usersRef, limit(1));
    const querySnapshot = await getDocs(q);
    const isFirstUser = querySnapshot.empty;

    const role = isFirstUser ? 'owner' : 'pending';
    const status = isFirstUser ? 'approved' : 'pending_approval';

    const newProfile = {
      email,
      displayName: displayName || email.split('@')[0],
      role,
      status,
      createdAt: serverTimestamp(),
    };

    // Create a user profile document in Firestore
    await setDoc(doc(db, 'users', cred.user.uid), newProfile);
    
    // Set local profile state immediately
    setUserProfile(newProfile);
    
    return cred;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  const value = {
    user,
    userProfile,
    loading,
    login,
    register,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
