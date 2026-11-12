import { readFileSync } from 'node:fs';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getAppCheck } from 'firebase-admin/app-check';
import { getFirestore } from 'firebase-admin/firestore';
import { env } from './env.js';

let adminApp = null;

if (env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON || env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH) {
  try {
    const serviceAccountJson = env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON
      || readFileSync(env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH, 'utf8');
    const serviceAccount = JSON.parse(serviceAccountJson);
    adminApp = getApps()[0] || initializeApp({
      credential: cert(serviceAccount),
      projectId: env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
    });
  } catch {
    console.error('Firebase Admin credentials could not be loaded or initialized.');
  }
}

export const firebaseAdminReady = Boolean(adminApp);
export const adminAuth = adminApp ? getAuth(adminApp) : null;
export const adminAppCheck = adminApp ? getAppCheck(adminApp) : null;
export const adminDb = adminApp ? getFirestore(adminApp) : null;
