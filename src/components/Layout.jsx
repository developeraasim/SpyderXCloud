import { useState } from 'react';
import { ArrowDown, ArrowRight, Bot, ChartNoAxesCombined, ChevronDown, Code2, Database, Globe2, HardDrive, Menu, Moon, PlugZap, Search, ShieldCheck, Smartphone, Sparkles, Sun, X } from 'lucide-react';
import { ROUTES, SERVICES } from '../data/siteData.js';
import { Link } from './Ui.jsx';

const SERVICE_ICONS = {
  bot: Bot, chart: ChartNoAxesCombined, code: Code2, database: Database, globe: Globe2,
  plug: PlugZap, search: Search, sparkles: Sparkles, phone: Smartphone, storage: HardDrive,
};

export function SiteHeader({ page, theme, onToggleTheme, user }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = [['home', 'Home'], ['services', 'Services'], ['help', 'Support']];
  const closeMenu = () => setMenuOpen(false);
  return <>
    <nav className="nav" aria-label="Primary navigation"><div className="nav-inner">
      <Link className="brand" onClick={closeMenu}><span className="brand-mark" aria-hidden="true"><ShieldCheck size={20}/></span><span><strong>SPYDER X CLOUD</strong><small>A SPYDER X SCRIPTS Product</small></span></Link>
      <div className="nav-links">{nav.map(([route, label]) => route === 'services' ? <div className="nav-item" key={route}>
        <Link to={route} className={`nav-link ${page === route ? 'active' : ''}`} aria-haspopup="true"><ArrowDown size={14}/><span>{label}</span><ChevronDown className="nav-chevron" size={13}/></Link>
        <div className="service-mega" role="menu" aria-label="Services">{SERVICES.map(service => { const Icon = SERVICE_ICONS[service.icon] || ShieldCheck; const comingSoon = service.route !== 'smm'; const content = <><span className="service-mega-icon"><Icon size={17} aria-hidden="true"/></span><span><strong>{service.title}</strong><small>{service.text}</small></span>{comingSoon ? <span className="service-mega-badge">Coming Soon</span> : <ArrowRight className="service-mega-arrow" size={15} aria-hidden="true"/>}</>; return comingSoon ? <span key={service.route} className="service-mega-item is-disabled" role="menuitem" aria-disabled="true">{content}</span> : <Link key={service.route} to={service.route} role="menuitem" onClick={closeMenu}>{content}</Link>; })}</div>
      </div> : <Link key={route} to={route} className={`nav-link ${page === route ? 'active' : ''}`}>{route === 'home' ? <Globe2 size={15}/> : route === 'pricing' ? <span className="nav-rupee">₹</span> : <ShieldCheck size={15}/>}<span>{label}</span></Link>)}</div>
      <div className="nav-actions">
        <button className="icon-btn" type="button" aria-label="Toggle color theme" onClick={onToggleTheme}>{theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</button>
        {user?.emailVerified ? <Link to="dashboard" className="btn btn-ghost nav-login">Client area</Link> : <Link to="login" className="btn btn-ghost nav-login">Login</Link>}
        {user?.emailVerified ? <Link to="dashboard" className="btn btn-primary nav-start">Dashboard <ArrowRight size={15} aria-hidden="true"/></Link> : <Link to="register" className="btn btn-primary nav-start">Get Started <ArrowRight size={15} aria-hidden="true"/></Link>}
        <button className="icon-btn mobile-toggle" type="button" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={21}/> : <Menu size={21}/>}</button>
      </div>
    </div></nav>
    <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
      {ROUTES.filter(([route]) => ['home','services','about','help','contact'].includes(route)).map(([route,label]) => <Link key={route} to={route} onClick={closeMenu}>{label}<ArrowRight size={15}/></Link>)}
      {user?.emailVerified ? <Link to="dashboard" onClick={closeMenu}>Client dashboard<ArrowRight size={15}/></Link> : <><Link to="login" onClick={closeMenu}>Login<ArrowRight size={15}/></Link><Link to="register" onClick={closeMenu}>Create account<ArrowRight size={15}/></Link></>}
      {SERVICES.map(service => service.route === 'smm'
        ? <Link key={service.route} to="smm" onClick={closeMenu}>{service.title}<ArrowRight size={15}/></Link>
        : <span className="mobile-disabled-link" key={service.route} aria-disabled="true"><span>{service.title}</span><small>Coming Soon</small></span>)}
    </div>
  </>;
}

export function SiteFooter() {
  const groups = [
    ['Services', ...SERVICES.map(service => service.route)],
    ['Company', 'about', 'contact', 'help'],
    ['Legal', 'terms', 'privacy', 'refund', 'faq'],
  ];
  return <footer className="footer"><div className="container"><div className="footer-grid">
    <div><Link className="brand"><span className="brand-mark" aria-hidden="true"><ShieldCheck size={20}/></span><span><strong>SPYDER X CLOUD</strong><small>A SPYDER X SCRIPTS Product</small></span></Link><p>Hosting. Digital Services. Software.</p></div>
    {groups.map(([heading,...routes]) => <div className="footer-col" key={heading}><h3>{heading}</h3>{routes.map(route => {const service=SERVICES.find(item=>item.route===route);return service && service.route!=='smm' ? <span className="footer-disabled-link" key={route}>{service.title}<small>Coming Soon</small></span> : <Link key={route} to={route}>{service?.title || ROUTES.find(([key]) => key === route)?.[1]}</Link>;})}</div>)}
  </div><div className="footer-bottom">© {new Date().getFullYear()} SPYDER X SCRIPTS. All rights reserved.</div></div></footer>;
}
