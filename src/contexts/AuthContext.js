// src/contexts/AuthContext.js
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirebaseAuth, googleProvider, githubProvider } from '../firebase';

export const AuthContext = createContext({
  user: null,
  authLoaded: false,
  error: null,
  signInGoogle: () => {},
  signInGithub: () => {},
  signOutUser: () => {},
  clearError: () => {},
});

// Popup only, no signInWithRedirect fallback: redirect is broken under Safari
// ITP whenever authDomain is a different site from the app, which is exactly
// our case (*.firebaseapp.com vs *.workers.dev).
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setAuthLoaded(true);
      return;
    }
    return onAuthStateChanged(auth, u => {
      setUser(u);
      setAuthLoaded(true);
    });
  }, []);

  // "One account per email" stays on (Firebase console default): auto-linking
  // is an account-takeover primitive, since GitHub emails are
  // attacker-choosable and arrive emailVerified: false.
  const handleSignInError = e => {
    if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') return;
    if (e.code === 'auth/account-exists-with-different-credential') {
      setError('An account already exists with that email using a different sign-in provider. Try signing in with the other provider.');
      return;
    }
    if (e.code === 'auth/popup-blocked') {
      setError('Popup was blocked. Please allow popups and click sign-in again.');
      return;
    }
    setError('Sign-in failed. Please try again.');
  };

  const signInGoogle = useCallback(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    setError(null);
    signInWithPopup(auth, googleProvider()).catch(handleSignInError);
  }, []);

  const signInGithub = useCallback(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    setError(null);
    signInWithPopup(auth, githubProvider()).catch(handleSignInError);
  }, []);

  const signOutUser = useCallback(() => {
    const auth = getFirebaseAuth();
    if (auth) firebaseSignOut(auth);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, authLoaded, error, signInGoogle, signInGithub, signOutUser, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
