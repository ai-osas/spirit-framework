"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        console.error('Authentication error:', error);
        router.push('/auth/login?error=auth_failed');
        return;
      }

      if (!code) {
        console.error('No authorization code received');
        router.push('/auth/login?error=callback_failed');
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/callback/?code=${code}`,
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Authentication failed:', errorData);
          throw new Error('Failed to authenticate with Google');
        }

        const data = await response.json();
        
        // Check if we received the expected tokens
        if (!data.access_token || !data.refresh_token) {
          throw new Error('Invalid token data received');
        }

        // Login with the received tokens
        await login({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });

        // Handle redirect
        const redirectTo = localStorage.getItem('auth_redirect') || '/';
        localStorage.removeItem('auth_redirect'); // Clean up
        router.push(redirectTo);

      } catch (error) {
        console.error('Auth error:', error);
        // Add error details to the URL for better debugging
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        router.push(`/auth/login?error=auth_failed&details=${encodeURIComponent(errorMessage)}`);
      }
    };

    handleCallback();
  }, [router, searchParams, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Completing Authentication...
        </h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          Please wait while we complete your authentication
        </p>
      </div>
    </div>
  );
}