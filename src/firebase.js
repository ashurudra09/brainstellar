// src/firebase.js
//
// This config is committed in the clear on purpose. Firebase web keys are public
// identifiers, not secrets: they ship inside the JS bundle wherever they are stored,
// so an .env file would buy nothing. The real security boundary is the Firestore
// rules plus the Authorized domains list in the Firebase console.
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyB99CVDIP6Xh8oD3JPtr-SPHVwxVLBPxok',
  authDomain: 'brainstellar-tracker.firebaseapp.com',
  projectId: 'brainstellar-tracker',
  storageBucket: 'brainstellar-tracker.firebasestorage.app',
  messagingSenderId: '931856937714',
  appId: '1:931856937714:web:f471f8d394bb9678a3566b',
};

// gatsby-ssr.js renders wrapRootElement in Node during `gatsby build`, where there is
// no window and these SDKs throw. Everything below is lazy, so importing this module
// is always safe -- only calling it (from inside an effect) touches the browser.
let app;
const firebaseApp = () => {
  if (typeof window === 'undefined') return null;
  if (!app) app = getApps()[0] || initializeApp(firebaseConfig);
  return app;
};

export const getFirebaseAuth = () => {
  const a = firebaseApp();
  return a ? getAuth(a) : null;
};

let db;
export const getDb = () => {
  const a = firebaseApp();
  if (!a) return null;
  // ignoreUndefinedProperties guards the `solvedAt: undefined` class of bug:
  // JSON.stringify drops undefined silently, Firestore throws on it.
  if (!db) db = initializeFirestore(a, { ignoreUndefinedProperties: true });
  return db;
};

export const googleProvider = () => new GoogleAuthProvider();
export const githubProvider = () => new GithubAuthProvider();
