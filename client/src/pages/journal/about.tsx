import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Coins, BookOpen, Shield, Users } from 'lucide-react';

export default function JournalAboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/">
            <img src="/spirit-logo.svg" alt="Spirit" className="h-8 w-auto cursor-pointer" />
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <div className="bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Spirit Journal
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Document your learning journey and earn rewards through blockchain-verified documentation
              </p>
              <Link href="/journal">
                <Button size="lg">Start Journaling</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <BookOpen className="w-8 h-8 text-yellow-500" />
                  <h3 className="text-2xl font-semibold">Knowledge Documentation</h3>
                </div>
                <p className="text-gray-600">
                  Capture your learning experiences, insights, and breakthroughs in a structured format. 
                  Add media attachments, code snippets, and connect related concepts to build your 
                  personal knowledge constellation.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-4 mb-6">
                  <Coins className="w-8 h-8 text-yellow-500" />
                  <h3 className="text-2xl font-semibold">Electroneum Rewards</h3>
                </div>
                <p className="text-gray-600">
                  Earn SPIRIT tokens for your valuable contributions. Rewards are calculated based on 
                  entry quality, consistency, and community engagement. Connect your Electroneum wallet 
                  to start earning.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-4 mb-6">
                  <Shield className="w-8 h-8 text-yellow-500" />
                  <h3 className="text-2xl font-semibold">Blockchain Verification</h3>
                </div>
                <p className="text-gray-600">
                  Your journal entries are verified and timestamped on the blockchain, creating an 
                  immutable record of your learning journey. Build credibility through verified 
                  documentation.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-4 mb-6">
                  <Users className="w-8 h-8 text-yellow-500" />
                  <h3 className="text-2xl font-semibold">Community Learning</h3>
                </div>
                <p className="text-gray-600">
                  Connect with other learners, share insights, and discover new perspectives. Your 
                  documented knowledge contributes to a growing ecosystem of shared understanding.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-50 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-8">Ready to Start Your Learning Journey?</h2>
            <div className="flex justify-center gap-4">
              <Link href="/journal">
                <Button size="lg">Launch App</Button>
              </Link>
              <Link href="/documentation">
                <Button variant="outline" size="lg">Read Documentation</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Spirit Framework. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
