"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout, loading } = useAuth();
  const router = useRouter();

  // Loading state
  if (loading) {
    return (
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/2.svg"
                  alt="Spirit Logo"
                  width={60}
                  height={60}
                />
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
              <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
              <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/2.svg"
                alt="Spirit Logo"
                width={60}
                height={60}
              />
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link href="/documentation" className="text-gray-600 hover:text-gray-900">
              Documentation
            </Link>
            <Link href="/community" className="text-gray-600 hover:text-gray-900">
              Community
            </Link>
            <Link
              href="https://oblack.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
            >
              Blog
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/journal" className="text-gray-600 hover:text-gray-900">
                  Journal
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/auth/login')}
                >
                  Sign in
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.push('/auth/register')}
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-b">
            <Link href="/" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link href="/documentation" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
              Documentation
            </Link>
            <Link href="/community" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
              Community
            </Link>
            <Link
              href="https://oblack.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2 text-gray-600 hover:text-gray-900"
            >
              Blog
            </Link>
            <div className="px-3 py-2 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link href="/journal" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                    Journal
                  </Link>
                  <Button 
                    size="sm" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline"
                    size="sm" 
                    className="w-full" 
                    onClick={() => router.push('/auth/login')}
                  >
                    Sign in
                  </Button>
                  <Button 
                    size="sm" 
                    className="w-full" 
                    onClick={() => router.push('/auth/register')}
                  >
                    Sign up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;