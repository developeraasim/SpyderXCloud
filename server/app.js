import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import healthRouter from './routes/health.js';
import clientRouter from './routes/client.js';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export const app = express();
const distDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');

app.disable('x-powered-by');
app.set('trust proxy', env.TRUST_PROXY_HOPS);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      styleSrc: ["'self'", 'https://fonts.googleapis.com'],
      scriptSrc: ["'self'", 'https://www.google.com/recaptcha/', 'https://www.gstatic.com/recaptcha/'],
      frameSrc: ["'self'", 'https://spyderxcloud.firebaseapp.com', 'https://www.google.com/recaptcha/', 'https://recaptcha.google.com/recaptcha/'],
      connectSrc: ["'self'", 'https://identitytoolkit.googleapis.com', 'https://securetoken.googleapis.com', 'https://firestore.googleapis.com', 'https://firebaseinstallations.googleapis.com', 'https://firebaseappcheck.googleapis.com', 'https://www.googleapis.com', 'https://www.google.com'],
      upgradeInsecureRequests: [],
    },
  },
}));
app.use(cors({
  origin: env.frontendOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Firebase-AppCheck'],
  maxAge: 600,
}));
app.use(express.json({ limit: '16kb', strict: true }));
app.use(express.urlencoded({ extended: false, limit: '16kb', parameterLimit: 50 }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
}));

app.get('/api', (_request, response) => response.json({ service: 'SPYDER X CLOUD API' }));
app.use('/api', healthRouter);
app.use('/api/client', rateLimit({ windowMs: 15 * 60 * 1000, limit: 60, standardHeaders: 'draft-8', legacyHeaders: false }), clientRouter);
app.use('/api', notFoundHandler);
app.use(express.static(distDirectory, { index: false, maxAge: env.NODE_ENV === 'production' ? '1h' : 0 }));
app.get('/{*path}', (_request, response, next) => {
  response.sendFile(resolve(distDirectory, 'index.html'), error => {
    if (error) next(error);
  });
});
app.use(notFoundHandler);
app.use(errorHandler);
