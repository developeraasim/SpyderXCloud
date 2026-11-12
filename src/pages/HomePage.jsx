import ownerImage from '../assets/images/founder.jpg';
import { ArrowUpRight, AtSign, Camera, Link2, Mail, Smartphone, Code2, Globe2, Cpu } from 'lucide-react';
import { EXPERTISE, FAQS, SERVICES, SOCIAL_LINKS } from '../data/siteData.js';
import { CardGrid, Link, SectionTitle } from '../components/Ui.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import CustomerFeedbackRail from '../components/CustomerFeedbackRail.jsx';
import { useAuth } from '../app/AuthContext.jsx';

const SOCIAL_ICONS = {
  'Twitter / X': AtSign,
  Email: Mail,
  LinkedIn: Link2,
  Instagram: Camera,
  GitHub: Code2,
};

const EXPERTISE_ICONS = [Smartphone, Code2, Globe2, Cpu];

function Hero({ onExplore }) {
  const labels = ['SMM Panel', 'Authorised SMM services', 'Order status'];
  return <>
    <header className="hero"><div className="hero-visual" aria-hidden="true"/><div className="container hero-container"><div className="hero-copy">
      <span className="eyebrow">Next-gen cloud solutions</span><h1>SPYDER X<br/><span>CLOUD</span></h1>
      <h2>Authorised SMM, made clearer</h2><p>Explore the available social media marketing service information, review order details, and follow transparent service status updates.</p>
      <div className="button-row"><button className="btn btn-primary btn-lg" onClick={onExplore}>Explore Services <span>→</span></button></div>
      <div className="hero-meta"><span>◇ Secure by design</span><span>ϟ Fast & scalable</span><span>◷ Expert support</span></div>
    </div></div></header>
    <div className="marquee"><div className="marquee-track">{[...labels,...labels].map((item,index)=><span key={`${item}-${index}`}>✓ &nbsp;{item}</span>)}</div></div>
  </>;
}

export default function HomePage({ onExplore }) {
  const { user } = useAuth();
  const availableServices = SERVICES.filter(service => service.route === 'smm');
  const upcomingServices = SERVICES.filter(service => service.route !== 'smm');
  const differentiators = [
    { title: 'Listing-level clarity', text: 'Review the specific service description, availability, and quantity requirements before deciding.' },
    { title: 'Account privacy', text: 'We never ask for your social-media password to provide an SMM service.' },
    { title: 'Order transparency', text: 'Service-specific price and order status should be clear before and after submission.' },
  ];
  return <>
    <Hero onExplore={onExplore}/>
    <section className="section" id="services"><div className="container"><SectionTitle eyebrow="Services" title="Available service" text="SMM is available today. The rest of the catalogue remains visible below as upcoming entries."/><div className="service-grid">{availableServices.map((service, index) => <ServiceCard key={service.route || service.title} service={service} index={index} />)}</div></div></section>
    <section className="section"><div className="container"><SectionTitle eyebrow="Upcoming services" title="Coming soon" text="These product categories are visible in the catalogue and will unlock when their launch workflow is ready."/><div className="service-grid">{upcomingServices.map((service, index) => <ServiceCard key={service.route || service.title} service={service} index={index} />)}</div></div></section>
    <section className="section band"><div className="container"><SectionTitle eyebrow="Why SPYDER X CLOUD" title="Built for reliability and control" text="A platform designed with security, performance, and clarity as first principles."/><CardGrid items={differentiators}/></div></section>
    <section className="section smm-overview-section"><div className="container"><SectionTitle eyebrow="SMM service" title="A service catalogue, not fixed plans" text="SMM orders are selected from available service listings—not subscription tiers. Service, quantity limits, price, and order status should be reviewed before placing an order."/><div className="smm-overview-grid"><article className="smm-overview-card"><span className="smm-overview-number">01</span><h3>Review available services</h3><p>Check each listing’s description, eligibility, quantity limits, and current availability before proceeding.</p></article><article className="smm-overview-card"><span className="smm-overview-number">02</span><h3>See the order details</h3><p>Review the selected service, requested quantity, and total shown for that specific order. No fixed SMM plans are advertised.</p></article><article className="smm-overview-card"><span className="smm-overview-number">03</span><h3>Track with clear status</h3><p>Order tracking and fulfilment become available when the authorised provider and service backend are configured.</p></article></div><div className="smm-overview-actions"><Link to={user?.emailVerified ? 'dashboard' : 'login'} className="btn btn-primary">{user?.emailVerified ? 'Open client dashboard' : 'Sign in to get started'} <ArrowUpRight size={16}/></Link><p>We never ask for your social-media password or promote fake engagement.</p></div></div></section>
    <CustomerFeedbackRail />
    <section className="section owner-section"><div className="container founder-portfolio">
      <div className="founder-photo-wrap"><img src={ownerImage} alt="Aasim Shaikh, software and web engineer" loading="lazy"/><span className="founder-photo-caption"><span className="founder-live-dot"/>Founder · SPYDER X SCRIPTS</span></div>
      <div className="founder-profile">
        <span className="eyebrow">Founder portfolio</span>
        <h2>Aasim <span>Shaikh</span></h2>
        <p className="founder-intro">I design and build practical digital products—from Android applications and software to full-stack web experiences. My focus is thoughtful engineering, clear user experiences, and dependable delivery.</p>
        <div className="expertise-block"><span className="founder-overline">EXPERT IN</span><div className="expertise-grid">{EXPERTISE.map((skill,index)=>{const Icon=EXPERTISE_ICONS[index];return <div className="expertise-item" key={skill}><Icon size={17} aria-hidden="true"/><span>{skill}</span></div>;})}</div></div>
        <div className="founder-socials" aria-label="Social media links">{SOCIAL_LINKS.map(({name,href,label})=>{const Icon=SOCIAL_ICONS[name];const external=href.startsWith('http');return <a key={name} href={href} aria-label={label} title={name} target={external?'_blank':undefined} rel={external?'noreferrer noopener':undefined}><Icon size={17} aria-hidden="true"/><span>{name}</span></a>;})}</div>
        <div className="button-row"><Link to="about" className="btn btn-primary">About the Brand <ArrowUpRight size={15}/></Link><Link to="contact" className="btn btn-ghost">Contact me</Link></div>
      </div>
    </div><p className="social-profile-note">Social buttons currently open each platform; replace their URLs with your personal profile links in the site data.</p></section>
    <section className="section"><div className="container narrow"><SectionTitle eyebrow="FAQ" title="Frequently asked questions"/>{FAQS.map(([question,answer])=><details className="faq-item" key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>
  </>;
}
