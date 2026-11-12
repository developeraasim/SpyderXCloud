import { Router } from 'express';

const router = Router();

router.get('/health', (_request, response) => {
  response.set('Cache-Control', 'no-store').json({ status: 'ok' });
});

export default router;
