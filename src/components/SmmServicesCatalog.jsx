import { useState } from 'react';
import { ArrowLeft, BadgeCheck, CircleDollarSign, ShieldCheck } from 'lucide-react';
import { useAuth } from '../app/AuthContext.jsx';
import { getAppCheckToken } from '../app/firebaseClient.js';
import { SMM_CATALOG } from '../../shared/smmCatalog.js';

let cashfreeScriptPromise;

function loadCashfreeScript() {
  if (window.Cashfree) return Promise.resolve();
  if (!cashfreeScriptPromise) {
    cashfreeScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.onload = resolve;
      script.onerror = () => {
        cashfreeScriptPromise = null;
        reject(new Error('Cashfree checkout could not load. Please try again.'));
      };
      document.head.appendChild(script);
    });
  }
  return cashfreeScriptPromise;
}

async function apiRequest(url, token, appCheckToken, body) {
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(appCheckToken ? { 'X-Firebase-AppCheck': appCheckToken } : {}),
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('The API is unreachable. Check that the Render API is deployed and api.spyderxcloud.in DNS/proxy is configured. If you already opened checkout, verify that order before trying again.');
  }
  const responseBody = await response.text();
  let result = null;
  try { result = JSON.parse(responseBody); } catch { /* The host may return an HTML error page. */ }
  if (!response.ok) {
    throw new Error(result?.error || (response.status >= 500
      ? `The API returned HTTP ${response.status}. Check Render deployment, DNS/proxy, and server logs. If checkout was opened, verify the existing order instead of paying again.`
      : `Request failed (${response.status}).`));
  }
  if (!result || typeof result !== 'object') throw new Error('The API returned an invalid response. Check the API deployment and proxy.');
  return result;
}

export default function SmmServicesCatalog({ onBack }) {
  const { user, getIdToken } = useAuth();
  const [serviceId, setServiceId] = useState(SMM_CATALOG[0].id);
  const [quantity, setQuantity] = useState('1');
  const [targetUrl, setTargetUrl] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [orderResult, setOrderResult] = useState(null);
  const [pendingOrderId, setPendingOrderId] = useState('');

  const selectedService = SMM_CATALOG.find(service => service.id === serviceId) || SMM_CATALOG[0];
  const quantityValue = Number(quantity);
  const total = Number.isInteger(quantityValue) && quantityValue > 0 && quantityValue <= 100
    ? selectedService.unitRate * quantityValue
    : null;

  async function verifyPayment(orderId, token, appCheckToken) {
    const result = await apiRequest('/api/client/orders/verify', token, appCheckToken, { orderId });
    if (result.ok !== true) throw new Error('Payment could not be verified yet. Please retry in a moment.');
    setOrderResult({ orderId, discordNotified: result.discordNotified });
    setPendingOrderId('');
    setBusy(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setOrderResult(null);
    setPendingOrderId('');
    if (!user?.emailVerified) {
      window.location.hash = '#/login';
      return;
    }
    if (total === null || !targetUrl.startsWith('https://') || !/^[6-9]\d{9}$/.test(customerPhone)) {
      setError('Enter a quantity from 1–100, a valid HTTPS target URL, and an Indian mobile number.');
      return;
    }

    setBusy(true);
    try {
      const [token, appCheckToken] = await Promise.all([getIdToken(), getAppCheckToken()]);
      const created = await apiRequest('/api/client/orders', token, appCheckToken, {
        serviceId: selectedService.id,
        quantity: quantityValue,
        targetUrl,
        customerPhone,
      });
      if (!created.order?.paymentSessionId || !created.order?.id || !created.order?.mode) {
        throw new Error('The server did not create a valid payment session.');
      }
      setPendingOrderId(created.order.id);
      await loadCashfreeScript();
      const cashfree = window.Cashfree({ mode: created.order.mode });
      setNotice('Complete the secure payment window to submit your order.');
      await cashfree.checkout({ paymentSessionId: created.order.paymentSessionId, redirectTarget: '_modal' });
      await verifyPayment(created.order.id, token, appCheckToken);
    } catch (requestError) {
      setError(requestError.message || 'Could not complete the order. Please try again.');
      setBusy(false);
    }
  }

  async function retryDiscordNotice() {
    if (!orderResult?.orderId) return;
    setBusy(true);
    setError('');
    try {
      const [token, appCheckToken] = await Promise.all([getIdToken(), getAppCheckToken()]);
      await verifyPayment(orderResult.orderId, token, appCheckToken);
    } catch (requestError) {
      setError(requestError.message || 'Could not retry the order notification.');
      setBusy(false);
    }
  }

  async function retryPaymentVerification() {
    if (!pendingOrderId) return;
    setBusy(true);
    setError('');
    try {
      const [token, appCheckToken] = await Promise.all([getIdToken(), getAppCheckToken()]);
      await verifyPayment(pendingOrderId, token, appCheckToken);
    } catch (requestError) {
      setError(requestError.message || 'Payment is not confirmed yet. Retry shortly.');
      setBusy(false);
    }
  }

  return <section className="smm-order-section" aria-labelledby="smm-order-title">
    {onBack && <button className="dashboard-text-button smm-order-back" type="button" onClick={onBack}><ArrowLeft size={15}/> Back to dashboard</button>}
    <header className="smm-order-heading">
      <span className="eyebrow"><ShieldCheck size={14}/> SMM SERVICE CATALOGUE</span>
      <h2 id="smm-order-title">Choose a service and place an order</h2>
      <p>Choose an authorized promotion listing, provide its public HTTPS target, then pay securely. Paid order details are sent to our team for manual fulfillment.</p>
    </header>

    <div className="smm-demo-notice" role="note"><strong>TEST CATALOGUE</strong><span>Every sample listing is priced at ₹1 per unit for checkout testing. Replace demo listings and rates before accepting real orders.</span></div>

    <div className="smm-order-layout">
      <div className="smm-listing-grid" aria-label="Available SMM services">
        {SMM_CATALOG.map(service => <button key={service.id} type="button" className={`smm-listing-card ${service.id === serviceId ? 'selected' : ''}`} onClick={() => { setServiceId(service.id); setOrderResult(null); setError(''); }} aria-pressed={service.id === serviceId}>
          <span className="smm-listing-platform">{service.platform}</span>
          <strong>{service.title}</strong>
          <span>{service.description}</span>
          <b>₹{service.unitRate.toFixed(2)} <small>/ {service.unitLabel}</small></b>
        </button>)}
      </div>

      <form className="smm-checkout-card" onSubmit={handleSubmit}>
        <span className="smm-checkout-kicker"><BadgeCheck size={15}/> ORDER DETAILS</span>
        <h3>{selectedService.title}</h3>
        <p>{selectedService.description}</p>
        <label><span>Target URL</span><input type="url" inputMode="url" placeholder="https://…" value={targetUrl} onChange={event => setTargetUrl(event.target.value.trim())} maxLength={500} required/><small>Public content or page only. Never provide an account password.</small></label>
        <div className="smm-checkout-fields">
          <label><span>Quantity</span><input type="number" min="1" max="100" step="1" value={quantity} onChange={event => setQuantity(event.target.value)} required/></label>
          <label><span>Mobile number</span><input type="tel" inputMode="numeric" autoComplete="tel-national" pattern="[6-9][0-9]{9}" maxLength="10" placeholder="10-digit number" value={customerPhone} onChange={event => setCustomerPhone(event.target.value.replace(/\D/g, '').slice(0, 10))} required/></label>
        </div>
        <div className="smm-checkout-total"><CircleDollarSign size={19}/><span><small>SERVER-VERIFIED TEST TOTAL</small><strong>{total === null ? 'Check quantity' : `₹${total.toFixed(2)} INR`}</strong><small>Final price is calculated by the server.</small></span></div>
        <button className="btn btn-primary smm-buy-button" type="submit" disabled={busy || total === null}>{busy ? 'Processing…' : user?.emailVerified ? 'Pay securely & place order' : 'Sign in to order'}</button>
        {!user?.emailVerified && <small className="smm-signin-note">A verified account is required to place an order.</small>}
        {notice && <p className="smm-order-notice" role="status">{notice}</p>}
        {error && <p className="smm-order-error" role="alert">{error}</p>}
        {pendingOrderId && !orderResult && <button className="smm-order-retry" type="button" onClick={retryPaymentVerification} disabled={busy}>{busy ? 'Checking…' : 'Check payment status'}</button>}
        {orderResult && <div className={`smm-order-result ${orderResult.discordNotified ? 'success' : 'pending'}`} role="status">
          <strong>{orderResult.discordNotified ? 'Payment confirmed — order sent to fulfillment.' : 'Payment confirmed — order notification is pending.'}</strong>
          <span>Order reference: {orderResult.orderId}</span>
          {!orderResult.discordNotified && <button type="button" onClick={retryDiscordNotice} disabled={busy}>{busy ? 'Retrying…' : 'Retry notification'}</button>}
        </div>}
        <small className="smm-order-footnote">Manual fulfillment begins after payment confirmation. Demo services/rates are for testing only.</small>
      </form>
    </div>
  </section>;
}
