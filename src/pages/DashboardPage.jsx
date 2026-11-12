import { lazy, Suspense, useEffect, useState } from 'react';
import { Activity, ArrowDownToLine, ArrowRight, Bell, Boxes, CircleHelp, Clock3, CreditCard, ExternalLink, LayoutDashboard, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { ACTIVE_SERVICES } from '../data/siteData.js';
import { useAuth } from '../app/AuthContext.jsx';
import { getAppCheckToken } from '../app/firebaseClient.js';
import ServiceCard from '../components/ServiceCard.jsx';
const SmmServicesCatalog = lazy(() => import('../components/SmmServicesCatalog.jsx'));
const MENU_ITEMS = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'My services', icon: Boxes },
  { label: 'Orders', icon: Activity },
  { label: 'Billing', icon: CreditCard },
  { label: 'Support', icon: CircleHelp },
];

async function readClientApiResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Secure API endpoint is missing. Confirm the web app and API are deployed together and /api routes reach the Express server.');
    }
    throw new Error(response.status === 503
      ? 'Firebase Admin API is not configured yet. Check the server environment variables in your hosting dashboard.'
      : 'The API could not confirm your verified session. Please sign in again.');
  }
  if (!contentType.includes('application/json')) {
    throw new Error('The website returned HTML instead of API data. Confirm /api requests are routed to the Express API.');
  }
  return response.json();
}

export default function DashboardPage({ initialView = 'Overview' }) {
  const { user, logout, getIdToken } = useAuth();
  const [activeMenu, setActiveMenu] = useState(initialView);
  const [notice, setNotice] = useState('');
  const [apiState, setApiState] = useState('checking');
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Client';

  useEffect(() => {
    let cancelled = false;
    async function verifyWithApi() {
      try {
        const token = await getIdToken();
        const appCheckToken = await getAppCheckToken();
        const response = await fetch('/api/client/session', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, ...(appCheckToken ? { 'X-Firebase-AppCheck': appCheckToken } : {}) },
        });
        const result = await readClientApiResponse(response);
        if (result.ok !== true) throw new Error('The API could not confirm your verified session. Please sign in again.');
        if (!cancelled) setApiState('verified');
      } catch (error) {
        if (!cancelled) {
          setApiState('unavailable');
          setNotice(error.message || 'Secure API session verification failed.');
        }
      }
    }
    verifyWithApi();
    return () => { cancelled = true; };
  }, [getIdToken]);

  const openProtectedArea = async (label) => {
    setActiveMenu(label);
    setNotice('');
    try {
      const token = await getIdToken();
      const appCheckToken = await getAppCheckToken();
      const response = await fetch('/api/client/services', { headers: { Authorization: `Bearer ${token}`, ...(appCheckToken ? { 'X-Firebase-AppCheck': appCheckToken } : {}) } });
      await readClientApiResponse(response);
      if (label !== 'Overview' && label !== 'My services') setNotice(`${label} will appear here when the secure API feature is enabled.`);
    } catch (error) {
      setNotice(error.message || 'The secure service API is not configured yet. No request can be sent.');
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.hash = '#/login';
  };

  return <section className="client-dashboard">
    <aside className="dashboard-sidebar">
      <a href="#/" className="dashboard-brand"><span className="dashboard-brand-mark"><ShieldCheck size={19}/></span><span><strong>SPYDER X</strong><small>CLIENT AREA</small></span></a>
      <div className="dashboard-workspace-label">WORKSPACE</div>
      <nav className="dashboard-nav" aria-label="Client dashboard">
        {MENU_ITEMS.map(({ label, icon: Icon }) => <button key={label} type="button" className={`dashboard-nav-item ${activeMenu === label ? 'active' : ''}`} onClick={() => openProtectedArea(label)}><Icon size={17}/><span>{label}</span>{label === 'My services' && <span className="dashboard-nav-count">{ACTIVE_SERVICES.length}</span>}</button>)}
      </nav>
      <div className="dashboard-sidebar-bottom"><div className="dashboard-security-note"><ShieldCheck size={16}/><span><strong>Verified session</strong><small>Email verified with Firebase</small></span></div><button className="dashboard-logout" type="button" onClick={handleLogout}><LogOut size={16}/> Sign out</button></div>
    </aside>

    <main className="dashboard-main">
      <header className="dashboard-topbar"><div><span className="dashboard-breadcrumb">Client Area <ArrowRight size={13}/> {activeMenu}</span><h1>{activeMenu === 'Overview' ? `Welcome, ${displayName}` : activeMenu}</h1></div><div className="dashboard-top-actions"><span className="dashboard-verified"><span/>Verified account</span><button type="button" className="dashboard-avatar" aria-label="Account profile"><UserRound size={18}/></button></div></header>

      {notice && <div className="dashboard-notice" role="status">{notice}</div>}

      {activeMenu === 'Overview' && <>
        <section className="dashboard-welcome-panel"><div><span className="dashboard-overline">SPYDER X CLOUD · CLIENT DASHBOARD</span><h2>Your services, all in one place.</h2><p>Manage your active services, follow order updates, and keep your account details close at hand.</p><button className="btn btn-primary" type="button" onClick={() => openProtectedArea('My services')}>View my service <ArrowRight size={15}/></button></div><div className="dashboard-welcome-art"><LayoutDashboard size={86} strokeWidth={1}/><span className="dashboard-orbit orbit-one"/><span className="dashboard-orbit orbit-two"/></div></section>

        <section className="dashboard-stat-grid" aria-label="Account summary"><article className="dashboard-stat-card"><span className="dashboard-stat-icon"><Boxes size={17}/></span><span className="dashboard-stat-label">ACTIVE SERVICES</span><strong>{ACTIVE_SERVICES.length}</strong><small>SMM service available</small></article><article className="dashboard-stat-card"><span className="dashboard-stat-icon"><Activity size={17}/></span><span className="dashboard-stat-label">OPEN ORDERS</span><strong>—</strong><small>Order API not connected</small></article><article className="dashboard-stat-card"><span className="dashboard-stat-icon"><CreditCard size={17}/></span><span className="dashboard-stat-label">ACCOUNT CREDIT</span><strong>—</strong><small>Billing API not connected</small></article><article className="dashboard-stat-card"><span className="dashboard-stat-icon"><ShieldCheck size={17}/></span><span className="dashboard-stat-label">ACCOUNT STATUS</span><strong className="dashboard-stat-status">Verified</strong><small>{apiState === 'verified' ? 'Firebase session verified by API' : apiState === 'checking' ? 'Checking secure API…' : 'Firebase email confirmed'}</small></article></section>

        <section className="dashboard-content-section"><div className="dashboard-section-heading"><div><span className="dashboard-overline">READY TO USE</span><h2>Active services</h2></div><button className="dashboard-text-button" onClick={() => openProtectedArea('My services')} type="button">View all <ArrowRight size={15}/></button></div><div className="dashboard-service-grid">{ACTIVE_SERVICES.map((service,index)=><ServiceCard key={service.route} service={service} index={index} to="smm-catalog"/>)}</div></section>

        <section className="dashboard-content-section dashboard-lower-grid"><article className="dashboard-panel"><div className="dashboard-section-heading"><div><span className="dashboard-overline">RECENT ACTIVITY</span><h2>Latest updates</h2></div><Clock3 size={17}/></div><div className="dashboard-empty"><span><Activity size={20}/></span><strong>No activity yet</strong><p>Service and order updates will appear here after the secure API is connected.</p></div></article><article className="dashboard-panel"><div className="dashboard-section-heading"><div><span className="dashboard-overline">ACCOUNT</span><h2>Profile & security</h2></div><UserRound size={17}/></div><div className="dashboard-profile-row"><span className="dashboard-profile-icon"><UserRound size={18}/></span><span><strong>{displayName}</strong><small>{user?.email}</small></span></div><div className="dashboard-profile-row"><span className="dashboard-profile-icon"><ShieldCheck size={18}/></span><span><strong>Email verified</strong><small>Firebase verified account</small></span><span className="dashboard-check">✓</span></div><p className="dashboard-footnote">This client dashboard verifies Firebase sign-in. Service ordering and billing remain unavailable until their backend APIs are implemented.</p></article></section>
      </>}

      {activeMenu === 'My services' && <section className="dashboard-content-section"><div className="dashboard-section-heading"><div><span className="dashboard-overline">YOUR ACCOUNT</span><h2>Active services</h2></div></div><div className="dashboard-service-grid">{ACTIVE_SERVICES.map((service,index)=><ServiceCard key={service.route} service={service} index={index} to="smm-catalog"/>)}</div></section>}

      {activeMenu === 'SMM services' && <Suspense fallback={<div className="dashboard-panel">Loading SMM services…</div>}><SmmServicesCatalog onBack={() => { window.location.hash = '#/dashboard'; }} /></Suspense>}
      {activeMenu !== 'Overview' && activeMenu !== 'My services' && activeMenu !== 'SMM services' && <section className="dashboard-panel dashboard-unavailable"><span><ArrowDownToLine size={23}/></span><h2>{activeMenu} API not connected</h2><p>This area is protected by verified Firebase authentication. Its data and actions will be enabled once the matching server-side API is implemented.</p><a href="#/help">Contact support <ExternalLink size={14}/></a></section>}
      <footer className="dashboard-footer"><span>© {new Date().getFullYear()} SPYDER X CLOUD · Secure client area</span><a href="#/help"><Bell size={14}/> Help & support</a><button type="button" onClick={handleLogout}><LogOut size={14}/> Sign out</button></footer>
    </main>
  </section>;
}
