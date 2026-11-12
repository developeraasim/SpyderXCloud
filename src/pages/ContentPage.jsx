import { lazy, Suspense } from 'react';
import { ACTIVE_SERVICES, LEGAL_COPY, FAQS, SERVICES } from '../data/siteData.js';
import { CardGrid, ContactForm, Link, PageHero } from '../components/Ui.jsx';
import { useAuth } from '../app/AuthContext.jsx';

const SmmServicesCatalog = lazy(() => import('../components/SmmServicesCatalog.jsx'));

const SERVICES_PAGE_ORDER = ['smm', 'bot-hosting', 'api-services', 'custom-development', 'db-hosting', 'prank-studio', 'web-hosting', 'shop', 'osint', 'storage', 'virtual-numbers'];

export default function ContentPage({ page }) {
  const { user } = useAuth();
  const service = ACTIVE_SERVICES.find(({ route }) => route === page);
  if (service) {
    return <>
      <PageHero eyebrow="SPYDER X CLOUD · AVAILABLE SERVICE" title="Authorised SMM Service" text="A service catalogue rather than fixed subscription plans. Availability and order options depend on the configured, authorised provider."/>
      <section className="section">
        <div className="container service-detail">
          <img className="service-detail-image" src={service.image} alt={`${service.title} service preview`} />
          <div>
            <span className="eyebrow">Service catalogue</span>
            <h2>Choose by service listing—not a fixed plan</h2>
            <p>{service.text}</p>
            <ul>{['Review each listing and its current availability', 'Check quantity limits and total before ordering', 'Track order status when the provider integration is active'].map(feature => <li key={feature}><span>✓</span>{feature}</li>)}</ul>
            <Link to={user?.emailVerified ? 'dashboard' : 'login'} className="btn btn-primary">{user?.emailVerified ? 'Open client dashboard' : 'Sign in to get started'} <span>→</span></Link>
          </div>
        </div>
      </section>
      <div className="container"><Suspense fallback={<div className="dashboard-panel">Loading SMM service listings…</div>}><SmmServicesCatalog /></Suspense></div>
    </>;
  }
  if (page === 'services') return <><PageHero eyebrow="Services" title="SMM is available now" text="Other products and services remain visible as disabled cards marked Coming Soon."/><section className="section"><div className="container"><CardGrid items={[...SERVICES].sort((a, b) => SERVICES_PAGE_ORDER.indexOf(a.route) - SERVICES_PAGE_ORDER.indexOf(b.route))}/></div></section></>;
  if (page === 'about') return <><PageHero eyebrow="About" title="SPYDER X CLOUD" text="A SPYDER X SCRIPTS product. The authorised SMM service is available now; additional services are marked Coming Soon until launch."/><section className="section"><div className="container legal"><h2>Our focus</h2><p>We are currently preparing the SPYDER X CLOUD service catalogue, with the authorised SMM service available as the first active offering. Other catalogue entries remain disabled until they are ready.</p><h2>What we don't do</h2><p>We don't claim services are orderable before launch, ask for social-media passwords, publish fabricated testimonials, or distribute unauthorised software.</p></div></section></>;
  if (page === 'contact') return <><PageHero eyebrow="Contact" title="Get in touch" text="For account issues, use the ticketing system inside the dashboard."/><section className="section"><div className="container form-container"><ContactForm/></div></section></>;
  if (['login','register','forgot'].includes(page)) return <section className="section auth-wrap"><div className="container"><div className="auth-box"><span className="eyebrow">Account</span><h2>{page === 'login' ? 'Welcome back' : page === 'register' ? 'Create your account' : 'Reset your password'}</h2><p>{page === 'login' ? 'Sign in to your SPYDER X CLOUD account.' : 'Account actions require a connected API server.'}</p><ContactForm kind={page}/><p className="auth-alt"><Link to={page === 'login' ? 'register' : 'login'}>{page === 'login' ? 'Create an account' : 'Back to sign in'}</Link> · <Link to="forgot">Forgot password?</Link></p></div></div></section>;
  if (page === 'help') return <><PageHero eyebrow="Support" title="Help Center" text="Browse help topics or contact the team."/><section className="section"><div className="container"><CardGrid items={[{title:'Create a ticket',text:'Ticketing requires a connected customer dashboard.',route:'login'},{title:'Frequently asked questions',text:'Find answers about services, billing, and security.',route:'faq'},{title:'Contact',text:'Send a non-account enquiry.',route:'contact'}]}/></div></section></>;
  if (page === 'faq') return <><PageHero eyebrow="Help" title="Frequently asked questions"/><section className="section"><div className="container narrow">{FAQS.map(([question,answer])=><details className="faq-item" key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section></>;
  if (LEGAL_COPY[page]) { const [title,...paragraphs] = LEGAL_COPY[page]; return <><PageHero eyebrow="Legal" title={title}/><section className="section"><div className="container legal"><div className="notice">Template policy: complete all bracketed fields and obtain local legal review before publication.</div><p><strong>Last updated:</strong> 11 November 2026</p>{paragraphs.map((text,index)=><div key={text}><h2>{index+1}. {['Overview','Service terms','Contact and changes'][index] || 'Additional information'}</h2><p>{text}</p></div>)}</div></section></>; }
  if (page === 'maintenance') return <section className="state-page"><div><div className="state-code">⏸</div><h1>We’ll be back shortly.</h1><p>SPYDER X CLOUD is under maintenance and development. Please try again later.</p><button className="btn btn-primary" onClick={() => window.location.reload()}>Try again ↻</button></div></section>;
  return <section className="state-page"><div><div className="state-code">404</div><h1>Page not found</h1><p>The page you’re looking for doesn’t exist or has moved.</p><Link to="home" className="btn btn-primary">Back to home</Link></div></section>;
}
