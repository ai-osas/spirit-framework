import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Brain, Code, Database, Network, Shield, Coins } from "lucide-react";
import { SiGithub } from "react-icons/si";

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
          <div className="flex gap-4">
            <Link href="/journal">
              <Button size="lg">Start Journaling</Button>
            </Link>
            <a 
              href="https://github.com/ai-osas/spirit-framework" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button 
                size="lg" 
                variant="outline" 
                className="flex items-center gap-2"
              >
                <SiGithub className="w-5 h-5" />
                View on GitHub
              </Button>
            </a>
          </div>
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

      {/* Security and Rewards Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">Privacy & Rewards</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-xl">
              <div className="mb-6">
                <Shield className="w-12 h-12 text-yellow-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">End-to-End Encryption</h3>
              <p className="text-gray-600">
                Your journal entries are encrypted using state-of-the-art encryption technology. Only you have access to your raw entries, ensuring your thoughts and insights remain completely private. Our learning pattern analysis works with anonymized data, maintaining the perfect balance between privacy and innovation.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl">
              <div className="mb-6">
                <Coins className="w-12 h-12 text-yellow-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Spirit Token Rewards</h3>
              <p className="text-gray-600">
                Get rewarded for your contributions to collective learning intelligence. Earn Spirit Tokens on the Electroneum blockchain for quality journal entries. These tokens represent your stake in the future of personalized learning technology. The more you contribute to the learning ecosystem, the more you're rewarded.
              </p>
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
            Your journal entries help build smarter, more personalized learning experiences for everyone. Start contributing today and earn rewards while maintaining complete privacy.
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