export function notFoundHandler(_request, response) {
  response.status(404).json({ error: 'Not found' });
}

export function errorHandler(error, request, response, _next) {
  if (response.headersSent) return;

  const firestoreApiDisabled = error.reason === 'SERVICE_DISABLED'
    || /Cloud Firestore API has not been used|Cloud Firestore API.*disabled/i.test(error.message || '');
  const firestoreDatabaseMissing = error.code === 5
    || error.code === '5'
    || /database.*not found/i.test(error.message || '');
  const firestorePermissionDenied = !firestoreApiDisabled && (error.code === 7
    || error.code === '7'
    || /PERMISSION_DENIED/.test(error.message || ''));
  const status = firestoreApiDisabled || firestoreDatabaseMissing || firestorePermissionDenied
    ? 503
    : Number.isInteger(error.status) && error.status >= 400 && error.status < 600
    ? error.status
    : 500;

  if (status >= 500) {
    const route = request.route?.path || request.path;
    const details = [error.name, error.code, error.providerStatus ? `provider-status:${error.providerStatus}` : '']
      .filter(Boolean)
      .join(', ');
    console.error(`API ${request.method} ${route} failed (${details || 'unknown error'})`);
  }

  const message = firestoreApiDisabled
    ? 'Cloud Firestore API is disabled for this Firebase project. Enable it in Google Cloud APIs, then retry.'
    : firestoreDatabaseMissing
      ? 'Firestore database is not created for this Firebase project. Create the default database in Firebase Console, then retry.'
    : firestorePermissionDenied
      ? 'Firebase Admin service account needs the Cloud Datastore User role (roles/datastore.user) to access Firestore.'
    : status === 502
      ? error.message || 'External payment service is unavailable.'
      : status === 500
        ? 'Internal server error'
        : 'Invalid request';
  response.status(status).json({ error: message });
}
