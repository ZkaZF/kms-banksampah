import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, signInAnon, logout as firebaseLogout } from '../lib/firebase';
import type { User, UserRole } from '../types';

// Demo mode: skip Firebase entirely (no real project configured).
// Enables usability testing without Firebase credentials.
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' ||
  !import.meta.env.VITE_FIREBASE_API_KEY ||
  import.meta.env.VITE_FIREBASE_API_KEY === 'demo-api-key' ||
  import.meta.env.VITE_FIREBASE_API_KEY === 'your-api-key-here';

export const isDemoMode = () => DEMO_MODE;

const DEMO_UID_KEY = 'demoUid';

function getOrCreateDemoUid(): string {
  let uid = localStorage.getItem(DEMO_UID_KEY);
  if (!uid) {
    uid = `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(DEMO_UID_KEY, uid);
  }
  return uid;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (role: UserRole, nama: string) => Promise<void>;
  logout: () => Promise<void>;
  setUserData: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      // Demo mode: DO NOT auto-restore session.
      // Always start at login page for usability testing.
      // User must explicitly log in each session.
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const storedRole = localStorage.getItem('userRole') as UserRole || 'nasabah';
        const storedName = localStorage.getItem('userName') || 'Pengguna';
        
        setUser({
          uid: fbUser.uid,
          role: storedRole,
          nama: storedName,
          email: fbUser.email || undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (role: UserRole, nama: string) => {
    localStorage.setItem('userRole', role);
    localStorage.setItem('userName', nama);
    
    if (DEMO_MODE) {
      // Demo mode: synthetic local user, no Firebase call
      setUser({
        uid: getOrCreateDemoUid(),
        role,
        nama,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return;
    }

    if (firebaseUser) {
      setUser({
        uid: firebaseUser.uid,
        role,
        nama,
        email: firebaseUser.email || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      // Sign in anonymously and wait for auth state to update
      const result = await signInAnon();
      if (result.user) {
        setUser({
          uid: result.user.uid,
          role,
          nama,
          email: result.user.email || undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
  };

  const logout = async () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    if (!DEMO_MODE) {
      await firebaseLogout();
    }
    setUser(null);
  };

  const setUserData = async (data: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...data, updatedAt: new Date() };
      setUser(updated);
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, logout, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };