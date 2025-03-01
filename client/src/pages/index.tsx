import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, Coffee, BookOpen, Users, Code, Heart } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img src="/spirit-logo.svg" alt="Spirit" className="h-8 w-auto" />
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/">
                  <a className="border-yellow-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Home
                  </a>
                </Link>
                <Link href="/docs">
                  <a className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Documentation
                  </a>
                </Link>
                <Link href="/community">
                  <a className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Community
                  </a>
                </Link>
                <Link href="/blog">
                  <a className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Blog
                  </a>
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              <Link href="/journal">
                <Button variant="outline">Sign in</Button>
              </Link>
              <Link href="/journal">
                <Button>Sign up</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <img src="/spirit-logo-full.svg" alt="Spirit Framework" className="h-24 mx-auto mb-8" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Mapping the constellations between code, stories, and human potential
          </h1>
          <div className="flex justify-center gap-4 mt-8">
            <Link href="/journal">
              <Button size="lg" className="gap-2">
                Get Started
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2">
              <Github className="w-5 h-5" />
              View on GitHub
            </Button>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">Our Mission</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-yellow-500" />
                  Natural Learning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Understanding and nurturing how minds naturally learn and grow.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-yellow-500" />
                  Open Technology
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Building tools that adapt to individual learning patterns.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-yellow-500" />
                  Community Driven
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Growing through collaboration and shared understanding.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Applications Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">Our Applications</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Spirit Journal</CardTitle>
                <div className="text-sm text-yellow-500 font-medium">Beta</div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Personal learning pattern journal
                </p>
                <Link href="/journal">
                  <Button variant="outline" className="w-full">Learn More</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Spirit Study</CardTitle>
                <div className="text-sm text-gray-500 font-medium">Coming Soon</div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Adaptive study companion
                </p>
                <Button variant="outline" className="w-full" disabled>Learn More</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Spirit Code</CardTitle>
                <div className="text-sm text-gray-500 font-medium">Coming Soon</div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  VS Code learning extension
                </p>
                <Button variant="outline" className="w-full" disabled>Learn More</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">Support Our Mission</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-yellow-500" />
                  Donate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Support our development with a one-time or recurring donation.
                </p>
                <Button variant="outline" className="w-full">Support Us</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-yellow-500" />
                  Buy us a coffee
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Back our campaign and help shape the future of learning.
                </p>
                <Button variant="outline" className="w-full">View Campaign</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="w-5 h-5 text-yellow-500" />
                  Contribute
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Join our open source community and help build better tools.
                </p>
                <Button variant="outline" className="w-full">View on GitHub</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Spirit Framework
              </h3>
              <p className="mt-4 text-base text-gray-500">
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
                    <a className="text-base text-gray-500 hover:text-gray-900">
                      Spirit Journal
                    </a>
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    Spirit Study
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    Spirit Code
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Resources
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    Community
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Legal
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    License
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8">
            <p className="text-base text-gray-400 text-center">
              © 2025 Spirit Framework. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
