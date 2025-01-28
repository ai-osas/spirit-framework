// src/components/auth/ProtectedRoute.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated && isClient) {
      // Store the current path for redirect after login
      const currentPath = window.location.pathname;
      localStorage.setItem('auth_redirect', currentPath);
      router.push(`/auth/login?from=${encodeURIComponent(currentPath)}`);
    }
  }, [loading, isAuthenticated, router, isClient]);

  // Show loading state while checking auth
  if (loading || !isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}