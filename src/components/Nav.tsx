"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu,
  X
} from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="font-bold text-xl">Spirit</Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
            <Link href="/documentation" className="text-gray-600 hover:text-gray-900">Documentation</Link>
            <Link href="/community" className="text-gray-600 hover:text-gray-900">Community</Link>
            <a 
              href="https://oblack.substack.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-600 hover:text-gray-900"
            >
              Blog
            </a>
            <Button size="sm" onClick={() => router.push('/')}>Get Started</Button>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-b">
            <Link href="/" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Home</Link>
            <Link href="/documentation" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Documentation</Link>
            <Link href="/community" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Community</Link>
            <a 
              href="https://oblack.substack.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block px-3 py-2 text-gray-600 hover:text-gray-900"
            >
              Blog
            </a>
            <div className="px-3 py-2">
              <Button size="sm" className="w-full" onClick={() => router.push('/')}>Get Started</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;