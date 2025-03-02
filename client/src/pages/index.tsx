import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, Heart, Coffee } from 'lucide-react';
import { Brain, Code, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <img src="/spirit-logo.svg" alt="Spirit" className="h-8 w-auto cursor-pointer" />
            </Link>
          </div>
          <nav className="flex items-center space-x-6">
            <Link href="/blog">
              <span className="text-gray-700 hover:text-gray-900 cursor-pointer">Blog</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Spirit Framework
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Mapping the constellations between code, stories, and human potential
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/journal">
              <Button className="gap-2">Get Started</Button>
            </Link>
            <a href="https://github.com/spirit-framework" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                <Github className="w-5 h-5" />
                View on GitHub
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-16">Our Mission</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="text-blue-500 mb-4">
              <Brain className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Natural Learning</h3>
            <p className="text-gray-600">
              Understanding and nurturing how minds naturally learn and grow.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="text-gray-900 mb-4">
              <Code className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Open Technology</h3>
            <p className="text-gray-600">
              Building tools that adapt to individual learning patterns.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="text-red-500 mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
            <p className="text-gray-600">
              Growing through collaboration and shared understanding.
            </p>
          </div>
        </div>
      </div>

      {/* Applications Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">Our Applications</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 mr-2 flex-shrink-0 text-blue-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="9" y1="3" x2="9" y2="21" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Spirit Journal</h3>
              </div>
              <div className="text-sm text-blue-500 font-medium mb-4">Beta</div>
              <p className="text-gray-600 mb-4">
                Personal learning pattern journal
              </p>
              <Link href="/journal">
                <Button variant="outline" className="w-full">Learn More</Button>
              </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 mr-2 flex-shrink-0 text-purple-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2v20M2 12h20" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Spirit Study</h3>
              </div>
              <div className="text-sm text-gray-500 font-medium mb-4">Coming Soon</div>
              <p className="text-gray-600 mb-4">
                Adaptive study companion
              </p>
              <Button variant="outline" className="w-full" disabled>Learn More</Button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 mr-2 flex-shrink-0 text-gray-700">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Spirit Code</h3>
              </div>
              <div className="text-sm text-gray-500 font-medium mb-4">Coming Soon</div>
              <p className="text-gray-600 mb-4">
                VS Code learning extension
              </p>
              <Button variant="outline" className="w-full" disabled>Learn More</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">Support Our Mission</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border p-6 rounded-lg">
              <div className="mb-4">
                <Coffee className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Donate</h3>
              <p className="text-gray-600 mb-8">
                Support our development with a one-time or recurring donation.
              </p>
              <Button variant="outline" className="w-full">Buy us a coffee</Button>
            </div>
            <div className="border p-6 rounded-lg">
              <div className="mb-4">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" />
                  <path d="M7.5 12.5L10.5 15.5L16.5 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Kickstarter</h3>
              <p className="text-gray-600 mb-8">
                Back our campaign and help shape the future of learning.
              </p>
              <Button variant="outline" className="w-full">View Campaign</Button>
            </div>
            <div className="border p-6 rounded-lg">
              <div className="mb-4">
                <Github className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Contribute</h3>
              <p className="text-gray-600 mb-8">
                Join our open source community and help build better tools.
              </p>
              <Button variant="outline" className="w-full">View on GitHub</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Spirit Framework
              </h3>
              <p className="mt-4 text-sm text-gray-300">
                Building the future of natural learning
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Products
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link href="/journal">
                    <span className="text-sm text-gray-300 hover:text-white cursor-pointer">
                      Spirit Journal
                    </span>
                  </Link>
                </li>
                <li>
                  <span className="text-sm text-gray-300 hover:text-white cursor-pointer">
                    Spirit Study
                  </span>
                </li>
                <li>
                  <span className="text-sm text-gray-300 hover:text-white cursor-pointer">
                    Spirit Code
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Resources
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <span className="text-sm text-gray-300 hover:text-white cursor-pointer">
                    Documentation
                  </span>
                </li>
                <li>
                  <span className="text-sm text-gray-300 hover:text-white cursor-pointer">
                    Blog
                  </span>
                </li>
                <li>
                  <span className="text-sm text-gray-300 hover:text-white cursor-pointer">
                    Community
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Legal
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <span className="text-sm text-gray-300 hover:text-white cursor-pointer">
                    Privacy Policy
                  </span>
                </li>
                <li>
                  <span className="text-sm text-gray-300 hover:text-white cursor-pointer">
                    Terms of Service
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8">
            <p className="text-sm text-gray-400 text-center">
              &copy; {new Date().getFullYear()} Spirit Framework. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}