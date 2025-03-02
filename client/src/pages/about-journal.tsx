
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Lightbulb, PuzzlePiece, TrendingUp } from 'lucide-react';
import { Link } from 'wouter';

export default function AboutJournalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Spirit Journal: Mapping Your Learning Journey
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A revolutionary platform that captures and analyzes your learning patterns to build 
              personalized learning experiences that adapt to how you learn.
            </p>
            <Link href="/journal">
              <Button size="lg" className="px-8">Start Journaling</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're building smart learning APIs that adapt to individual learning patterns using journaling data 
            to create personalized education experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold">Personalized Learning</h3>
              </div>
              <p className="text-gray-600">
                By capturing your unique learning patterns, Spirit Journal helps create a learning 
                constellation that reflects your personal approach to understanding new concepts.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 p-3 rounded-full mr-4">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-semibold">Data-Driven Insights</h3>
              </div>
              <p className="text-gray-600">
                Your journaling contributions help build a rich dataset that powers our adaptive 
                learning algorithms, creating smarter systems for everyone.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Spirit Journal combines intuitive journaling with advanced pattern recognition to map your learning journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-2 rounded-full mr-4">
                  <PuzzlePiece className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold">Journal Your Learning</h3>
              </div>
              <p className="text-gray-600">
                Document your learning experiences, insights, and challenges as you explore new concepts and skills.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="bg-yellow-100 p-2 rounded-full mr-4">
                  <Lightbulb className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold">Discover Patterns</h3>
              </div>
              <p className="text-gray-600">
                Our system identifies your unique learning patterns and creates a personalized learning constellation.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-2 rounded-full mr-4">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold">Adaptive Learning</h3>
              </div>
              <p className="text-gray-600">
                As we gather more data, our APIs adapt to provide increasingly personalized learning experiences.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Join the Learning Revolution
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Be part of building the future of personalized education by contributing your learning patterns.
        </p>
        <Link href="/journal">
          <Button size="lg" className="px-8">Start Your Journal</Button>
        </Link>
      </div>
    </div>
  );
}
