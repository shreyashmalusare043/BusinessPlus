import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import IntersectObserver from '@/components/common/IntersectObserver';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { RouteGuard } from '@/components/common/RouteGuard';
import AppLayout from '@/components/layouts/AppLayout';
import routes from './routes';

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <RouteGuard>
            <Helmet>
              <title>Business Plus | GST Billing & Inventory Management System</title>
              <meta name="description" content="Business Plus" />
              <meta name="keywords" content="Business Plus, Billing Software, GST Billing System, Inventory Management, HRSAC, Free Billing App India" />
              
              {/* सोशल मीडियासाठी ओजी टॅग्स */}
              <meta property="og:title" content="Business Plus - Smart Billing Solution" />
              <meta property="og:description" content="तुमच्या व्यवसायाचे बिलिंग आता करा अधिक सोपे. Business Plus सह." />
              <meta property="og:type" content="website" />
            </Helmet>
            <IntersectObserver />
            <Routes>
            {routes.map((route, index) => {
              // Public pages without layout
              const publicPaths = [
                '/',
                '/login',
                '/signup',
                '/company-setup',
                '/verify-email',
                '/auth/callback',
                '/forgot-password',
                '/forgot-email',
                '/reset-password',
                '/forgot-username',
                '/privacy-policy',
                '/terms-conditions',
                '/refund-policy',
                '/data-security-policy',
              ];
              
              if (publicPaths.includes(route.path)) {
                return <Route key={index} path={route.path} element={route.element} />;
              }
              // All other pages use AppLayout
              return (
                <Route
                  key={index}
                  path={route.path}
                  element={<AppLayout>{route.element}</AppLayout>}
                />
              );
            })}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </RouteGuard>
      </AuthProvider>
    </ThemeProvider>
  </Router>
);
};

export default App;
