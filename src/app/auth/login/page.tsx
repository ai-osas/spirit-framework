"use client";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Chrome, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const from = searchParams.get('from') || '/';

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Get the stored redirect path or use the 'from' query param
      const redirectTo = localStorage.getItem('auth_redirect') || from;
      localStorage.removeItem('auth_redirect'); // Clean up
      router.push(redirectTo);
    }
  }, [isAuthenticated, loading, router, from]);

  useEffect(() => {
    // Check for error params from OAuth callback
    const error = searchParams.get('error');
    if (error) {
      setError(
        error === 'callback_failed' 
          ? 'Authentication failed. Please try again.' 
          : 'An error occurred during sign in.'
      );
    }
  }, [searchParams]);


  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Store current path
      const origin = searchParams.get('from') || '/';
      localStorage.setItem('auth_redirect', origin);
      
      // Redirect directly to Django's OAuth endpoint
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/login/?from=${encodeURIComponent(origin)}`;
    } catch {
      setError('Failed to initiate login. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/2.svg"
                alt="Spirit Logo"
                width={60}
                height={60}
              />
            </Link>
          </div>
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          <Button
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Chrome className="h-5 w-5" />
            )}
            {isLoading ? 'Connecting...' : 'Continue with Google'}
          </Button>
          <div className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <button
              onClick={() => router.push('/auth/register')}
              className="text-blue-500 hover:text-blue-600"
              disabled={isLoading}
            >
              Sign up
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}