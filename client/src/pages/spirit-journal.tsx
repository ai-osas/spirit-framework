import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Brain, Code, Database, Network } from "lucide-react";

export default function SpiritJournalPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Spirit Journal: Your Learning Intelligence Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl">
            More than just a journal - Spirit Journal is a pioneering platform that transforms your learning experiences into personalized intelligence, helping build smarter educational tools for everyone.
          </p>
          <Link href="/journal">
            <Button size="lg">Start Journaling</Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Building Smart Learning APIs
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Every journal entry contributes to our mission of creating adaptive learning systems. We analyze patterns in how individuals document their learning journey to build APIs that:
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Brain className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-600">Understand individual learning styles and preferences</p>
                </li>
                <li className="flex items-start gap-3">
                  <Code className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-600">Generate personalized learning recommendations</p>
                </li>
                <li className="flex items-start gap-3">
                  <Database className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-600">Create knowledge graphs from learning patterns</p>
                </li>
                <li className="flex items-start gap-3">
                  <Network className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-600">Connect related concepts across different domains</p>
                </li>
              </ul>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">How It Works</h3>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg">
                  <h4 className="font-medium mb-2">1. Document Your Learning</h4>
                  <p className="text-gray-600">Journal your learning experiences, insights, and connections</p>
                </div>
                <div className="bg-white p-6 rounded-lg">
                  <h4 className="font-medium mb-2">2. Pattern Recognition</h4>
                  <p className="text-gray-600">Our system analyzes your learning patterns and preferences</p>
                </div>
                <div className="bg-white p-6 rounded-lg">
                  <h4 className="font-medium mb-2">3. API Development</h4>
                  <p className="text-gray-600">Patterns become APIs that power adaptive learning tools</p>
                </div>
                <div className="bg-white p-6 rounded-lg">
                  <h4 className="font-medium mb-2">4. Continuous Improvement</h4>
                  <p className="text-gray-600">The system evolves as more learning data is collected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Be Part of the Learning Revolution
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Your journal entries help build smarter, more personalized learning experiences for everyone.
          </p>
          <Link href="/journal">
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900">
              Start Contributing
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
