import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './components/ui/toast';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ServicesPage } from './pages/ServicesPage';
import { RequestServicePage } from './pages/RequestServicePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPortalPage } from './pages/admin/AdminPortalPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 mins cache
      retry: 1,
    },
  },
});

export default function App() {
  // Simple & reliable route parser compatible with iframes & direct links
  const getInitialRoute = () => {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash) return hash;
    const path = window.location.pathname;
    return path || '/';
  };

  const [currentPath, setCurrentPath] = useState<string>(getInitialRoute());
  const [routeParams, setRouteParams] = useState<Record<string, string>>({});

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash) {
        setCurrentPath(hash);
      } else {
        setCurrentPath(window.location.pathname || '/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigate = (path: string, params?: Record<string, string>) => {
    setCurrentPath(path);
    if (params) setRouteParams(params);
    else setRouteParams({});

    window.location.hash = path;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine current active view
  const renderView = () => {
    // Admin route
    if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
      return <AdminPortalPage onExitAdmin={() => navigate('/')} />;
    }

    // Project detail: /projets/:slug
    if (currentPath.startsWith('/projets/') && currentPath !== '/projets') {
      const slug = currentPath.replace('/projets/', '');
      return (
        <ProjectDetailPage
          slug={slug}
          onBack={() => navigate('/projets')}
          onNavigateProject={(newSlug) => navigate(`/projets/${newSlug}`)}
          onRequestQuote={(serviceId) => navigate('/demande', serviceId ? { serviceId } : undefined)}
        />
      );
    }

    switch (currentPath) {
      case '/projets':
        return <ProjectsPage onSelectProject={(slug) => navigate(`/projets/${slug}`)} />;
      case '/services':
        return <ServicesPage onSelectService={(serviceId) => navigate('/demande', { serviceId })} />;
      case '/demande':
        return (
          <RequestServicePage
            initialServiceId={routeParams.serviceId}
            onBack={() => navigate('/services')}
          />
        );
      case '/a-propos':
        return <AboutPage onRequestContact={() => navigate('/contact')} />;
      case '/contact':
        return <ContactPage />;
      case '/':
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  const isAdminView = currentPath === '/admin' || currentPath.startsWith('/admin/');

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen bg-[#090a0c] text-zinc-100 flex flex-col selection:bg-amber-500 selection:text-zinc-950 font-sans">
            {!isAdminView && <Navbar currentPath={currentPath} onNavigate={navigate} />}
            <main className="flex-1">{renderView()}</main>
            {!isAdminView && <Footer onNavigate={navigate} />}
          </div>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
