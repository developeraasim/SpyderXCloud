import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, authPersistenceReady, firebaseReady } from './firebaseClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!firebaseReady || !auth) {
      setLoading(false);
      setAuthError('Firebase is not configured. Add the Firebase web-app values to .env.local, then restart the app.');
      return undefined;
    }

    let unsubscribe = () => {};
    authPersistenceReady
      .then(() => {
        unsubscribe = onAuthStateChanged(auth, nextUser => {
          setUser(nextUser);
          setLoading(false);
        }, () => {
          setUser(null);
          setLoading(false);
          setAuthError('Could not verify the current sign-in session. Please sign in again.');
        });
      })
      .catch(() => {
        setLoading(false);
        setAuthError('Secure session setup failed. Please refresh and try again.');
      });

    return () => unsubscribe();
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    authError,
    configured: firebaseReady,
    async logout() {
      if (auth) await signOut(auth);
    },
    async getIdToken() {
      if (!user || !user.emailVerified) throw new Error('Verified sign-in required.');
      return user.getIdToken();
    },
  }), [user, loading, authError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
