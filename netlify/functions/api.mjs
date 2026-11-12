import serverless from 'serverless-http';
import { app } from '../../server/app.js';

const expressHandler = serverless(app);

export async function handler(event, context) {
  const path = event.path.replace(/^\/.netlify\/functions\/api(?=\/|$)/, '/api');
  const sourceIp = event.headers?.['x-nf-client-connection-ip']
    || event.headers?.['x-forwarded-for']?.split(',')[0]?.trim()
    || '127.0.0.1';
  return expressHandler({
    ...event,
    path,
    requestContext: {
      ...event.requestContext,
      identity: { ...event.requestContext?.identity, sourceIp },
    },
  }, context);
}
