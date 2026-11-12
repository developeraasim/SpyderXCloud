import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { getToken, initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Firebase web-app settings are identifiers, not secrets. They are necessarily visible in browser bundles.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAsKSJP2Y-5O_EnF6f32QauDX_5ffsHHnA',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'spyderxcloud.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'spyderxcloud',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'spyderxcloud.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '881031988148',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:881031988148:web:7b64fd3b2d5903e927e8e1',
};

export const firebaseReady = Object.values(firebaseConfig).every(Boolean);

const app = firebaseReady
  ? (getApps().length ? getApp() : initializeApp(firebaseConfig))
  : null;

export const auth = app ? getAuth(app) : null;
const appCheckSiteKey = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY;
export const appCheck = app && appCheckSiteKey
  ? initializeAppCheck(app, { provider: new ReCaptchaV3Provider(appCheckSiteKey), isTokenAutoRefreshEnabled: true })
  : null;
export const authPersistenceReady = auth
  ? setPersistence(auth, browserSessionPersistence)
  : Promise.resolve();

export async function getAppCheckToken() {
  if (!appCheck) return '';
  const result = await getToken(appCheck, false);
  return result.token;
}
