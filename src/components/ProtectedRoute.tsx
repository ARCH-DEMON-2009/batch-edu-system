
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [accessStatus, setAccessStatus] = useState<'loading' | 'verified' | 'ads' | 'denied'>('loading');

  useEffect(() => {
    checkAccessStatus();
  }, []);

  const checkAccessStatus = () => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    if (cookies.verified === 'true') {
      setAccessStatus('verified');
    } else if (cookies.ads === 'true') {
      setAccessStatus('ads');
    } else {
      setAccessStatus('denied');
    }
  };

  // Show Monetag ads for ads users
  useEffect(() => {
    if (accessStatus === 'ads') {
      // Inject Monetag ad script
      const script = document.createElement('script');
      script.src = '//cdn.monetag.io/js/monetag.js';
      script.async = true;
      document.head.appendChild(script);

      return () => {
        // Cleanup script when component unmounts
        const existingScript = document.querySelector('script[src*="monetag"]');
        if (existingScript) {
          existingScript.remove();
        }
      };
    }
  }, [accessStatus]);

  if (accessStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  if (accessStatus === 'denied') {
    return <Navigate to="/key-generation" replace />;
  }

  return (
    <div>
      {children}
      {accessStatus === 'ads' && (
        <div id="monetag-ads-container">
          {/* Monetag ads will be injected here */}
        </div>
      )}
    </div>
  );
};

export default ProtectedRoute;
