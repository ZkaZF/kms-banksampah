import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  type Auth, 
  signInAnonymously, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  type Firestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  Timestamp,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Firebase configuration - replace with actual config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef",
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

// Auth helpers
export const signInAnon = () => signInAnonymously(auth);
export const signInWithEmail = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);
export const registerWithEmail = (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => onAuthStateChanged(auth, callback);

// Firestore helpers
export const col = (path: string) => collection(db, path);
export const docRef = (path: string, id: string) => doc(db, path, id);
export const getDocument = (path: string, id: string) => getDoc(docRef(path, id));
export const getDocuments = (path: string, constraints?: any[]) => getDocs(query(col(path), ...(constraints || [])));
export const addDocument = (path: string, data: any) => addDoc(col(path), { ...data, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
export const updateDocument = (path: string, id: string, data: any) => updateDoc(docRef(path, id), { ...data, updatedAt: Timestamp.now() });
export const deleteDocument = (path: string, id: string) => deleteDoc(docRef(path, id));
export const batchWrite = () => writeBatch(db);
export const subscribeToCollection = (path: string, callback: (docs: any[]) => void, constraints?: any[]) => {
  const q = query(col(path), ...(constraints || []));
  return onSnapshot(q, (snapshot) => {
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(docs);
  });
};

export { auth, db, storage, Timestamp };
export default app;