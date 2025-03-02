import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Github, Brain, Code, Users } from "lucide-react";

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
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
      </div>

      {/* Applications Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">Our Applications</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">Spirit Journal</h3>
              <div className="text-sm text-yellow-500 font-medium mb-4">Beta</div>
              <p className="text-gray-600 mb-4">
                Personal learning pattern journal
              </p>
              <Link href="/journal">
                <Button variant="outline" className="w-full">Learn More</Button>
              </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">Spirit Study</h3>
              <div className="text-sm text-gray-500 font-medium mb-4">Coming Soon</div>
              <p className="text-gray-600 mb-4">
                Adaptive study companion
              </p>
              <Button variant="outline" className="w-full" disabled>Learn More</Button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">Spirit Code</h3>
              <div className="text-sm text-gray-500 font-medium mb-4">Coming Soon</div>
              <p className="text-gray-600 mb-4">
                VS Code learning extension
              </p>
              <Button variant="outline" className="w-full" disabled>Learn More</Button>
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