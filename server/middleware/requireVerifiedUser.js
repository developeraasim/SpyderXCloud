import { adminAppCheck, adminAuth, firebaseAdminReady } from '../config/firebaseAdmin.js';
import { env } from '../config/env.js';

export async function requireVerifiedUser(request, response, next) {
  if (!firebaseAdminReady || !adminAuth) {
    return response.status(503).json({ error: 'Authentication service is not configured.' });
  }

  const header = request.get('authorization') || '';
  const match = /^Bearer\s+([^\s]+)$/i.exec(header);
  if (!match) return response.status(401).json({ error: 'Verified sign-in required.' });

  try {
    if (env.FIREBASE_APP_CHECK_ENFORCED === 'true') {
      const appCheckToken = request.get('x-firebase-appcheck');
      if (!adminAppCheck || !appCheckToken) return response.status(401).json({ error: 'App attestation required.' });
      await adminAppCheck.verifyToken(appCheckToken);
    }
    const decoded = await adminAuth.verifyIdToken(match[1], true);
    if (!decoded.email || decoded.email_verified !== true) {
      return response.status(403).json({ error: 'Verified email required.' });
    }
    request.authUser = decoded;
    return next();
  } catch {
    return response.status(401).json({ error: 'Session is invalid or expired. Sign in again.' });
  }
}
