import apiImage from '../assets/images/Service-apiservices.png';
import botImage from '../assets/images/Service-bothosting.png';
import developmentImage from '../assets/images/Service-customdevelopment.png';
import databaseImage from '../assets/images/Service-dbhosting.png';
import osintImage from '../assets/images/Service-osint.png';
import smmImage from '../assets/images/Service-smm.png';
import prankImage from '../assets/images/Service-spamprank.png';
import storageImage from '../assets/images/Service-storage.png';
import virtualNumberImage from '../assets/images/Service-virtualnumber.png';
import webHostingImage from '../assets/images/Service-webhosting.svg';
import softwareImage from '../assets/images/Service-softwaretools.svg';

export const ROUTES = [
  ['home', 'Home'], ['services', 'Services'], ['smm', 'SMM Panel'],
  ['dashboard', 'Client dashboard'], ['smm-catalog', 'SMM services'],
  ['about', 'About'], ['contact', 'Contact'], ['help', 'Help Center'],
  ['faq', 'FAQ'], ['terms', 'Terms of Service'], ['privacy', 'Privacy Policy'],
  ['refund', 'Refund Policy'], ['login', 'Login'], ['register', 'Register'],
  ['forgot', 'Forgot Password'], ['maintenance', 'Maintenance'],
];

export const SERVICES = [
  { title: 'Bot Hosting', cardTitle: '24/7 Discord & Telegram Bot Hosting', route: 'bot-hosting', text: 'Run Python or Node.js bots on managed hosting with supervised processes, restart controls, live logs, and plan-specific resource limits.', image: botImage, icon: 'bot', features: ['24/7 process supervision', 'Live logs and controls', 'Resource-limited isolated workloads'] },
  { title: 'SMM Panel', cardTitle: 'Authorised Social Media Marketing Panel', route: 'smm', text: 'Browse clearly described, authorised marketing services and review order pricing, quantity limits, progress, and eligible support options.', image: smmImage, icon: 'chart', features: ['Clear service descriptions', 'Order status tracking', 'No requests for account passwords'] },
  { title: 'API Services', cardTitle: 'API Integration & Webhook Development', route: 'api-services', text: 'Connect applications through documented REST APIs and reliable webhook workflows, with credentials stored and used on the server side.', image: apiImage, icon: 'plug', features: ['Documented REST integrations', 'Webhook-ready workflows', 'Credentials kept server-side'] },
  { title: 'Custom Development', cardTitle: 'Custom Websites, Apps & Software Development', route: 'custom-development', text: 'Plan and build tailored websites, Android applications, dashboards, and software with clear scope, milestones, and delivery expectations.', image: developmentImage, icon: 'code', features: ['Web and app development', 'Admin dashboards', 'Scoped project delivery'] },
  { title: 'Database Hosting', cardTitle: 'Managed Database Hosting & Backup Services', route: 'db-hosting', text: 'Host application databases with controlled access, monitoring, backup options, and configuration matched to your workload requirements.', image: databaseImage, icon: 'database', features: ['Managed database instances', 'Backups and monitoring', 'Restricted credentials and access'] },
  { title: 'Prank Studio', cardTitle: 'Consent-Based Prank Concepts & Simulations', route: 'prank-studio', text: 'Design harmless entertainment concepts and preview-only simulations that respect consent and do not send real unsolicited calls or messages.', image: prankImage, icon: 'sparkles', features: ['Preview-only simulations', 'No real unsolicited calls or messages', 'Respectful, consent-based entertainment'] },
  { title: 'Cloud Storage', cardTitle: 'Secure Cloud File Storage & Sharing', route: 'storage', text: 'Keep project files organised with access-controlled sharing options and storage plans that can support your backup and collaboration needs.', image: storageImage, icon: 'storage', features: ['Organized file storage', 'Access-controlled sharing', 'Backup-ready plans'] },
  { title: 'Web Hosting', cardTitle: 'Managed Website Hosting & Deployment', route: 'web-hosting', text: 'Deploy PHP, Node.js, and React websites with custom-domain support, SSL configuration, database options, and backup-ready plans.', image: webHostingImage, icon: 'globe', features: ['Static and application hosting', 'Custom domain and SSL', 'Backup-ready deployments'] },
  { title: 'Software & Tools', cardTitle: 'Licensed Software, Apps & Developer Tools', route: 'shop', text: 'Explore legitimate software, mobile apps, developer utilities, and digital licences with compatibility and delivery terms shown before purchase.', image: softwareImage, icon: 'code', features: ['Product-specific licence terms', 'Secure digital delivery', 'Compatibility details before purchase'] },
  { title: 'OSINT Research', cardTitle: 'Ethical OSINT & Domain Exposure Research', route: 'osint', text: 'Review public business and domain information for lawful security and exposure assessments, without tracking or exposing private individuals.', image: osintImage, icon: 'search', features: ['Public-source business research', 'Domain and asset exposure reviews', 'No private-person tracking or doxxing'] },
  { title: 'Virtual Numbers', cardTitle: 'Business Virtual Numbers & Communication', route: 'virtual-numbers', text: 'Explore virtual number options for legitimate business communication, with availability and usage terms clearly explained before ordering.', image: virtualNumberImage, icon: 'phone', features: ['Business communication use', 'Transparent number availability', 'No platform-policy bypass or account abuse'] },
];

// SMM is available. All other catalogue items stay visible but disabled until launched.
export const ACTIVE_SERVICES = SERVICES.filter(service => service.route === 'smm');

export const EXPERTISE = ['Android Engineer', 'Software Engineer', 'Full-Stack Web Engineer', 'Reverse Engineer'];

export const SOCIAL_LINKS = [
  { name: 'Twitter / X', href: 'https://x.com/', label: 'Open Twitter / X' },
  { name: 'Email', href: '#/contact', label: 'Contact by email' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/', label: 'Open LinkedIn' },
  { name: 'Instagram', href: 'https://www.instagram.com/', label: 'Open Instagram' },
  { name: 'GitHub', href: 'https://github.com/', label: 'Open GitHub' },
];

export const FAQS = [
  ['What service is currently available?', 'The authorised SMM service is currently available. Other services remain visible as Coming Soon and cannot be opened or ordered yet.'],
  ['Is the payment gateway live?', 'Payment processing requires a connected backend and verified payment-provider configuration. This static front end does not process payments.'],
  ['Does SMM have fixed plans?', 'No. SMM is organised as a service catalogue rather than fixed subscription plans. Any available listing should show its scope, quantity rules, availability, and price before an order.'],
  ['How is my data protected?', 'Production security depends on the connected backend, including server-side sessions, access controls, and secure password storage.'],
  ['How do I get support?', 'Use the Help Center or contact form. A live ticketing system requires a connected API.'],
];

export const LEGAL_COPY = {
  terms: ['Terms of Service', 'These Terms govern access to SPYDER X CLOUD, operated by [FULL LEGAL NAME / REGISTERED BUSINESS NAME], trading as SPYDER X SCRIPTS. Replace bracketed business and contact details and obtain local legal review before accepting customers.', 'Use the services only for lawful purposes and within each plan’s published resource limits. Order details, prices, billing interval, delivery method, and cancellation terms must be displayed before purchase. Mandatory consumer rights remain unaffected.', 'Hosting, SMM, and digital services are provided only when explicitly configured and orderable. Do not rely on a front-end success message as proof of payment or service activation.'],
  privacy: ['Privacy Policy', 'This is a template and must be checked against the live website and its actual hosting, analytics, email, payment, and support systems. Replace all bracketed fields before publishing.', 'The platform may process account and contact information, service configuration, order records, security logs, and support requests to provide and protect services. List actual providers, retention periods, transfer safeguards, and legal contacts after review.', 'Privacy requests: [PRIVACY EMAIL]. State only technical practices that are actually implemented in production.'],
  refund: ['Refund Policy', 'Complete the operator and support details and have this policy reviewed for the countries where you sell. Nothing here removes a non-waivable statutory consumer right.', 'Refund eligibility depends on the service, delivery status, purchase terms, and applicable law. For hosting, SMM orders, or digital products, contact [SUPPORT EMAIL] with the order reference and details.', 'Approved refunds are returned to the original payment method where supported. Add realistic processing times and contact details before publication.'],
};
