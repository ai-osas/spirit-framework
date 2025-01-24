"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Brain,
  Code,
  Heart,
  Github,
  Download,
  Coffee,
  Sparkles,
  Book,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import Navigation from '@/components/Nav';


export default function SpiritWebsitePreview() {
  const router = useRouter();

  const applications = [
    {
      title: "Spirit Journal",
      icon: <Book className="w-5 h-5 text-blue-600" />,
      description: "Personal learning pattern journal",
      status: "Beta",
      path: "/journal"
    },
    {
      title: "Spirit Study",
      icon: <Brain className="w-5 h-5 text-purple-600" />,
      description: "Adaptive study companion",
      status: "Coming Soon"
    },
    {
      title: "Spirit Code",
      icon: <Code className="w-5 h-5 text-green-600" />,
      description: "VS Code learning extension",
      status: "Alpha"
    }
  ]

  return (
    <div className="min-h-screen flex flex-col border rounded-lg overflow-hidden">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              Spirit Framework
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              Mapping the constellations between code, stories, and human potential
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="gap-2">
                <Download className="w-5 h-5" />
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Github className="w-5 h-5" />
                View on GitHub
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Mission</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gray-50 border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  Natural Learning
                </CardTitle>
              </CardHeader>
              <CardContent>
                Understanding and nurturing how minds naturally learn and grow.
              </CardContent>
            </Card>
            <Card className="bg-gray-50 border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-purple-600" />
                  Open Technology
                </CardTitle>
              </CardHeader>
              <CardContent>
                Building tools that adapt to individual learning patterns.
              </CardContent>
            </Card>
            <Card className="bg-gray-50 border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-600" />
                  Community Driven
                </CardTitle>
              </CardHeader>
              <CardContent>
                Growing through collaboration and shared understanding.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Applications</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {applications.map((app) => (
              <Card key={app.title} className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {app.icon}
                    {app.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">{app.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{app.status}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => app.path && router.push(app.path)}
                    >
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Support Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Support Our Mission</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coffee className="h-6 w-6" />
                  Donate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Support our development with a one-time or recurring donation.</p>
                <Button className="w-full">Buy us a coffee</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6" />
                  Kickstarter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Back our campaign and help shape the future of learning.</p>
                <Button className="w-full">View Campaign</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-6 w-6" />
                  Contribute
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Join our open source community and help build better tools.</p>
                <Button className="w-full">View on GitHub</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}