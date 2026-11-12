import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import ServiceCard from './ServiceCard.jsx';

export function Link({ to = 'home', children, className = '', onClick, ...props }) {
  return <a href={`#/${to === 'home' ? '' : to}`} className={className} onClick={onClick} {...props}>{children}</a>;
}

export function SectionTitle({ eyebrow, title, text }) {
  return <div className="section-title"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{text && <p>{text}</p>}</div>;
}

export function CardGrid({ items }) {
  if (items.some(item => item.image)) return <div className="service-grid">{items.map((service, index) => service.image ? <ServiceCard key={service.route || service.title} service={service} index={index}/> : <article className="card feature-card" key={service.title}><span className="card-icon"><Check size={19}/></span><h3>{service.title}</h3><p>{service.text}</p></article>)}</div>;
  return <div className="grid grid-3">{items.map(({ title, text, route }, index) => {
    const content = <><span className="card-icon">{['⌘', '◎', '⌁', '▧'][index % 4]}</span><h3>{title}</h3><p>{text}</p>{route && <span className="card-link">Explore <ArrowRight size={15}/></span>}</>;
    return route ? <Link key={title} to={route} className="card">{content}</Link> : <article key={title} className="card feature-card">{content}</article>;
  })}</div>;
}

export function PageHero({ eyebrow, title, text }) {
  return <header className="page-hero"><div className="container"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{text && <p>{text}</p>}</div></header>;
}

export function ContactForm({ kind = 'contact' }) {
  const [status, setStatus] = useState('');
  const submit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setStatus('Please enter a valid email address.');
    if (kind === 'contact' && String(data.get('message') || '').trim().length < 10) return setStatus('Please write a longer message.');
    if (kind === 'register' && String(data.get('password')) !== String(data.get('confirm'))) return setStatus('Passwords do not match.');
    setStatus(kind === 'contact' ? 'This static page has no live contact endpoint. No message was sent.' : 'Account actions require the SPYDER X CLOUD API server. This page does not process credentials.');
  };
  return <form className="form" onSubmit={submit}>
    {(kind === 'contact' || kind === 'register') && <Field label="Full name" name="name" placeholder="Your name"/>}
    <Field label="Email" name="email" type="email" placeholder="you@example.com"/>
    {kind === 'contact' ? <><Field label="Subject" name="subject" placeholder="How can we help?"/><Field label="Message" name="message" placeholder="Write your message..." textarea/></> : kind === 'forgot' ? null : <><Field label="Password" name="password" type="password" placeholder="At least 8 characters"/>{kind === 'register' && <Field label="Confirm password" name="confirm" type="password" placeholder="Repeat password"/>}</>}
    <button className="btn btn-primary btn-block" type="submit">{kind === 'contact' ? 'Send message' : kind === 'forgot' ? 'Send reset link' : kind === 'register' ? 'Create account' : 'Sign in'}</button>
    {status && <p className="form-status" role="status">{status}</p>}
  </form>;
}

function Field({ label, name, type = 'text', placeholder, textarea = false }) {
  return <div className="field"><label htmlFor={name}>{label}</label>{textarea ? <textarea id={name} name={name} placeholder={placeholder} required minLength={10}/> : <input id={name} name={name} type={type} placeholder={placeholder} required autoComplete={name === 'email' ? 'email' : undefined} minLength={type === 'password' ? 8 : undefined}/>}</div>;
}
