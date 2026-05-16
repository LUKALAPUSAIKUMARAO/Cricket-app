import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, set, onValue, off } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if config is provided and app hasn't been initialized
const app = getApps().length === 0 && firebaseConfig.apiKey ? initializeApp(firebaseConfig) : getApps()[0];

export const db = app ? getDatabase(app) : null;

// Helper to push match state
export const syncMatchStateToCloud = (matchId: string, state: any) => {
  if (!db || !matchId) return;
  const matchRef = ref(db, `matches/${matchId}`);
  set(matchRef, {
    ...state,
    timestamp: Date.now()
  }).catch(err => console.error("Firebase sync error:", err));
};

// Helper to subscribe to match state
export const subscribeToMatchState = (matchId: string, callback: (state: any) => void) => {
  if (!db || !matchId) return () => {};
  
  const matchRef = ref(db, `matches/${matchId}`);
  onValue(matchRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data);
    }
  });

  return () => off(matchRef);
};
