import { ArrowUpRight, Bot, ChartNoAxesCombined, Cloud, Code2, Database, Globe2, PlugZap, Search, ShieldCheck, Sparkles, Smartphone, HardDrive } from 'lucide-react';
import { Link } from './Ui.jsx';

const ICONS = {
  bot: Bot,
  chart: ChartNoAxesCombined,
  code: Code2,
  database: Database,
  globe: Globe2,
  plug: PlugZap,
  search: Search,
  sparkles: Sparkles,
  phone: Smartphone,
  storage: HardDrive,
  shield: ShieldCheck,
  cloud: Cloud,
};

export default function ServiceCard({ service, index = 0, to }) {
  const Icon = ICONS[service.icon] || Cloud;
  const isComingSoon = service.route !== 'smm';
  const destination = to || service.route;
  const isThirdRowFeature = ['web-hosting', 'shop', 'osint'].includes(service.route);
  const cardClassName = `service-card${isComingSoon ? ' is-disabled' : ''}${isThirdRowFeature ? ' is-third-row-feature' : ''}`;
  const ctaText = service.route === 'smm' ? 'Continue' : 'Coming Soon';
  const cardContent = <>
    <div className="service-card-image-wrap">
      <img className="service-card-image" src={service.image} alt={`${service.title} service`} loading={index < 3 ? 'eager' : 'lazy'} />
      <span className="service-card-open" aria-hidden="true"><ArrowUpRight size={17} /></span>
    </div>
    <div className="service-card-copy">
      <div className="service-card-heading">
        <span className="service-card-icon"><Icon size={19} strokeWidth={1.8} aria-hidden="true" /></span>
        <span><span className="service-card-kicker">SPYDER X CLOUD · SERVICE</span><h3>{service.cardTitle || service.title}</h3></span>
      </div>
      <p>{service.text}</p>
      {isComingSoon
        ? <span className="coming-soon-tag">Coming Soon</span>
        : <span className="service-card-cta">{ctaText} <ArrowUpRight size={15} aria-hidden="true" /></span>}
    </div>
  </>;

  return isComingSoon
    ? <article className={cardClassName} data-card-index={index} aria-disabled="true">{cardContent}</article>
    : <Link to={destination} className={cardClassName} data-card-index={index}>{cardContent}</Link>;
}
