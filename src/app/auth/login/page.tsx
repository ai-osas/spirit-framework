"use client";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Chrome } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    // Here we'll handle Google OAuth redirect
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/`;
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
        <Button 
          className="w-full flex items-center justify-center gap-2"
          onClick={handleGoogleLogin}
        >
          <Chrome className="h-5 w-5" />
          Continue with Google
        </Button>
          
          <div className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <button 
              onClick={() => router.push('/auth/register')}
              className="text-blue-500 hover:text-blue-600"
            >
              Sign up
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}