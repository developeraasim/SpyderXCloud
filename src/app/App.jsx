import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { SiteFooter, SiteHeader } from '../components/Layout.jsx';
import { ROUTES } from '../data/siteData.js';
import { useAuth } from './AuthContext.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import AuthPage from '../pages/AuthPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import ContentPage from '../pages/ContentPage.jsx';
import HomePage from '../pages/HomePage.jsx';

function routeFromHash() {
  const value = window.location.hash.replace(/^#\/?/, '').replace(/\/$/, '');
  return value || 'home';
}

export default function App() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState(routeFromHash);
  const [theme, setTheme] = useState(() => localStorage.getItem('sxc-theme') || 'dark');

  useEffect(() => {
    const updateRoute = () => {
      const nextPage = routeFromHash();
      const update = () => setPage(nextPage);
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (document.startViewTransition && !reduceMotion) document.startViewTransition(() => flushSync(update));
      else update();
    };
    window.addEventListener('hashchange', updateRoute);
    return () => window.removeEventListener('hashchange', updateRoute);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('sxc-theme', theme);
  }, [theme]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page]);

  useEffect(() => {
    const targets = document.querySelectorAll('.section-title, .service-card, .card, .price-card, .service-detail, .owner > *, .faq-item');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(target => target.classList.add('reveal-on-scroll', 'is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });

    targets.forEach(target => {
      target.classList.add('reveal-on-scroll');
      observer.observe(target);
    });

    return () => observer.disconnect();
  }, [page]);

  const activePage = ROUTES.some(([route]) => route === page) ? page : '404';
  const immersivePage = ['dashboard', 'smm-catalog', 'login', 'register', 'forgot'].includes(activePage);
  const goToServices = () => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  const toggleTheme = () => setTheme(current => current === 'dark' ? 'light' : 'dark');
  const finishLogin = () => { window.location.hash = '#/dashboard'; };

  useEffect(() => {
    if (!loading && user?.emailVerified && ['login', 'register', 'forgot'].includes(activePage)) {
      window.location.hash = '#/dashboard';
    }
  }, [activePage, loading, user]);

  return <>
    {!immersivePage && <SiteHeader page={activePage} theme={theme} onToggleTheme={toggleTheme} user={user} />}
    <main>
      <div key={activePage} className={`page-content ${['dashboard', 'smm-catalog'].includes(activePage) ? 'page-content-dashboard' : ''}`}>
        {activePage === 'home' ? <HomePage onExplore={goToServices} />
          : ['dashboard', 'smm-catalog'].includes(activePage) ? <ProtectedRoute onGoToLogin={() => { window.location.hash = '#/login'; }}><DashboardPage initialView={activePage === 'smm-catalog' ? 'SMM services' : 'Overview'} /></ProtectedRoute>
            : ['login', 'register', 'forgot'].includes(activePage) ? <AuthPage key={activePage} mode={activePage} onAuthenticated={finishLogin} />
              : <ContentPage page={activePage} />}
      </div>
    </main>
    {!['dashboard', 'smm-catalog', 'login', 'register', 'forgot', 'terms', 'privacy', 'refund'].includes(activePage) && <SiteFooter />}
  </>;
}
