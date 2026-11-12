import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../config/firebaseAdmin.js';
import { env } from '../config/env.js';
import { requireVerifiedUser } from '../middleware/requireVerifiedUser.js';
import { SMM_CATALOG } from '../../shared/smmCatalog.js';
import { z } from 'zod';

const router = Router();
const ACTIVE_SERVICES = [{ id: 'smm', name: 'Authorised SMM Service', status: 'active', route: '/#/smm' }];
const CreateOrderSchema = z.object({
  serviceId: z.string().min(1).max(100),
  quantity: z.number().int().min(1).max(100),
  targetUrl: z.string().url().max(500).refine(value => value.startsWith('https://'), 'HTTPS URL required'),
  customerPhone: z.string().regex(/^[6-9]\d{9}$/),
});
const VerifyOrderSchema = z.object({ orderId: z.string().regex(/^cf_[a-f0-9]{32}$/i) });

function cashfreeApiBase() {
  return env.CASHFREE_ENV === 'production' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';
}

function discordWebhookIsConfigured() {
  try {
    const url = new URL(env.DISCORD_ORDER_WEBHOOK_URL);
    return url.protocol === 'https:'
      && ['discord.com', 'discordapp.com'].includes(url.hostname)
      && url.pathname.startsWith('/api/webhooks/');
  } catch {
    return false;
  }
}

async function cashfreeRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${cashfreeApiBase()}${path}`, {
      ...options,
      headers: {
        'x-client-id': env.CASHFREE_APP_ID,
        'x-client-secret': env.CASHFREE_SECRET_KEY,
        'x-api-version': '2025-01-01',
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      },
      signal: AbortSignal.timeout(15000),
      cache: 'no-store',
    });
  } catch {
    const error = new Error('Payment provider is unreachable. Please try again later.');
    error.status = 502;
    throw error;
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) {
    const error = new Error(response.status === 401
      ? 'Payment provider credentials do not match the selected environment.'
      : 'Payment provider rejected the request.');
    error.status = 502;
    error.providerStatus = response.status;
    throw error;
  }
  return data;
}

async function postOrderToDiscord(orderId, order) {
  const response = await fetch(env.DISCORD_ORDER_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(10000),
    body: JSON.stringify({
      allowed_mentions: { parse: [] },
      embeds: [{
        title: 'Paid SMM order — manual fulfillment',
        color: 0x5865f2,
        fields: [
          { name: 'Order ID', value: orderId, inline: true },
          { name: 'Customer email', value: String(order.customerEmail).slice(0, 120), inline: true },
          { name: 'Customer phone', value: String(order.customerPhone), inline: true },
          { name: 'Service', value: String(order.serviceTitle).slice(0, 200), inline: true },
          { name: 'Quantity', value: String(order.quantity), inline: true },
          { name: 'Amount paid', value: `₹${Number(order.amount).toFixed(2)} INR`, inline: true },
          { name: 'Target URL', value: String(order.targetUrl).slice(0, 500) },
        ],
        timestamp: new Date().toISOString(),
      }],
    }),
  });
  if (!response.ok) throw new Error(`Discord webhook returned HTTP ${response.status}.`);
}

async function notifyDiscordOnce(orderId, orderRef, order) {
  const shouldSend = await adminDb.runTransaction(async transaction => {
    const snapshot = await transaction.get(orderRef);
    const current = snapshot.data();
    if (!current || current.paymentStatus !== 'paid' || current.discordStatus === 'sent' || current.discordStatus === 'sending') return false;
    transaction.update(orderRef, { discordStatus: 'sending', discordAttemptedAt: FieldValue.serverTimestamp() });
    return true;
  });
  if (!shouldSend) return order.discordStatus === 'sent';

  try {
    await postOrderToDiscord(orderId, order);
    await orderRef.update({ discordStatus: 'sent', discordSentAt: FieldValue.serverTimestamp() });
    return true;
  } catch (error) {
    await orderRef.update({ discordStatus: 'failed', discordError: error.message.slice(0, 160) }).catch(() => {});
    return false;
  }
}

router.use(requireVerifiedUser);

router.post('/session', async (request, response, next) => {
  if (!adminDb) return response.status(503).json({ error: 'Client database is not configured.' });
  try {
    const userRef = adminDb.collection('users').doc(request.authUser.uid);
    const existing = await userRef.get();
    const profile = {
      uid: request.authUser.uid,
      email: request.authUser.email,
      displayName: typeof request.authUser.name === 'string' ? request.authUser.name.slice(0, 100) : '',
      emailVerified: true,
      lastSignInAt: FieldValue.serverTimestamp(),
    };
    if (!existing.exists) profile.createdAt = FieldValue.serverTimestamp();
    await userRef.set(profile, { merge: true });
    response.set('Cache-Control', 'no-store').json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.get('/me', async (request, response, next) => {
  if (!adminDb) return response.status(503).json({ error: 'Client database is not configured.' });
  try {
    const snapshot = await adminDb.collection('users').doc(request.authUser.uid).get();
    if (!snapshot.exists) return response.status(404).json({ error: 'Client profile not initialized.' });
    const profile = snapshot.data();
    response.set('Cache-Control', 'no-store').json({
      uid: request.authUser.uid,
      email: request.authUser.email,
      displayName: profile.displayName || '',
      emailVerified: true,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/services', (_request, response) => {
  response.set('Cache-Control', 'no-store').json({ services: ACTIVE_SERVICES });
});

router.get('/catalog', (_request, response) => {
  response.set('Cache-Control', 'no-store').json({ services: SMM_CATALOG });
});

router.post('/orders', async (request, response, next) => {
  const input = CreateOrderSchema.safeParse(request.body);
  if (!input.success) return response.status(400).json({ error: 'Choose a service, quantity, and valid HTTPS target URL.' });
  if (!adminDb) return response.status(503).json({ error: 'Order storage is not configured.' });
  if (!env.CASHFREE_APP_ID || !env.CASHFREE_SECRET_KEY || !discordWebhookIsConfigured()) {
    return response.status(503).json({ error: 'Checkout is not configured yet. Contact support.' });
  }
  const service = SMM_CATALOG.find(item => item.id === input.data.serviceId);
  if (!service) return response.status(400).json({ error: 'This service listing is not available.' });

  const orderId = `cf_${randomUUID().replaceAll('-', '')}`;
  const amount = service.unitRate * input.data.quantity;
  const orderRef = adminDb.collection('orders').doc(orderId);
  const customerEmail = String(request.authUser.email || '').toLowerCase();
  const customerId = request.authUser.uid.replace(/[^A-Za-z0-9]/g, '').slice(0, 50) || 'customer';
  const order = {
    uid: request.authUser.uid,
    customerEmail,
    customerPhone: input.data.customerPhone,
    serviceId: service.id,
    serviceTitle: service.title,
    unitRate: service.unitRate,
    quantity: input.data.quantity,
    targetUrl: input.data.targetUrl,
    amount,
    currency: 'INR',
    paymentStatus: 'creating',
    discordStatus: 'pending',
    createdAt: FieldValue.serverTimestamp(),
  };

  try {
    await orderRef.create(order);
    const providerOrder = await cashfreeRequest('/orders', {
      method: 'POST',
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: customerId,
          customer_email: customerEmail,
          customer_phone: input.data.customerPhone,
          customer_name: typeof request.authUser.name === 'string' && request.authUser.name.length >= 3
            ? request.authUser.name.slice(0, 100)
            : 'Customer',
        },
        order_note: `SMM test order: ${service.platform}`,
      }),
    });
    if (providerOrder.order_id !== orderId || !providerOrder.payment_session_id) {
      throw new Error('Payment provider did not return a valid payment session.');
    }
    await orderRef.update({ paymentStatus: 'created', cashfreeOrderStatus: providerOrder.order_status || 'ACTIVE' });
    response.set('Cache-Control', 'no-store').status(201).json({
      order: { id: orderId, amount, currency: 'INR', paymentSessionId: providerOrder.payment_session_id, mode: env.CASHFREE_ENV },
    });
  } catch (error) {
    await orderRef.update({ paymentStatus: 'gateway_error', updatedAt: FieldValue.serverTimestamp() }).catch(() => {});
    next(error);
  }
});

router.post('/orders/verify', async (request, response, next) => {
  const input = VerifyOrderSchema.safeParse(request.body);
  if (!input.success) return response.status(400).json({ error: 'Payment verification details are invalid.' });
  if (!adminDb || !env.CASHFREE_APP_ID || !env.CASHFREE_SECRET_KEY) {
    return response.status(503).json({ error: 'Payment verification is not configured.' });
  }
  try {
    const { orderId } = input.data;
    const orderRef = adminDb.collection('orders').doc(orderId);
    const snapshot = await orderRef.get();
    if (!snapshot.exists || snapshot.data().uid !== request.authUser.uid) {
      return response.status(404).json({ error: 'Order not found.' });
    }
    let order = snapshot.data();
    if (order.paymentStatus !== 'paid') {
      const providerOrder = await cashfreeRequest(`/orders/${encodeURIComponent(orderId)}`);
      if (providerOrder.order_id !== orderId || providerOrder.order_amount !== order.amount || providerOrder.order_currency !== order.currency) {
        return response.status(400).json({ error: 'Payment does not match this order.' });
      }
      if (providerOrder.order_status !== 'PAID') {
        return response.status(409).json({ error: 'Payment is not confirmed yet. Refresh and retry in a moment.' });
      }
      await orderRef.update({ paymentStatus: 'paid', cashfreeOrderStatus: 'PAID', paidAt: FieldValue.serverTimestamp() });
      order = { ...order, paymentStatus: 'paid', cashfreeOrderStatus: 'PAID' };
    }
    const discordNotified = await notifyDiscordOnce(orderId, orderRef, order);
    response.set('Cache-Control', 'no-store').json({ ok: true, orderId, discordNotified });
  } catch (error) {
    next(error);
  }
});

export default router;
