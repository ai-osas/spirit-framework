// src/components/SpiritJournal.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Brain, Star, ArrowRight, Book,
  Plus, Users, Filter, Calendar,
  MessageCircle, Send, X
} from 'lucide-react';
import { ChatDialog } from '@/components/ChatDialog';
import { useWalkthrough } from '@/components/walkthrough/WalkthroughProvider';
import { WalkthroughHighlight } from '@/components/walkthrough/WalkthroughHighlight'; 
import { WalkthroughTooltip } from '@/components/walkthrough/WalkthroughToolTip'; 


// interface ChatDialogProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// const ChatDialog: React.FC<ChatDialogProps> = ({ isOpen, onClose }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-xl flex flex-col border-2 border-blue-200 z-50">
//       <div className="p-4 border-b bg-blue-50 flex justify-between items-center">
//         <div className="flex items-center gap-2">
//           <Brain className="w-5 h-5 text-blue-600" />
//           <h3 className="font-medium">Pattern Assistant</h3>
//         </div>
//         <button onClick={onClose} className="hover:bg-blue-100 p-1 rounded-full">
//           <X className="w-5 h-5 text-gray-500" />
//         </button>
//       </div>
      
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         <div className="flex justify-start">
//           <div className="bg-gray-100 rounded-2xl px-4 py-2 max-w-[80%]">
//             <p className="text-sm">How would you like to explore your learning patterns today?</p>
//           </div>
//         </div>
//         <div className="flex justify-end">
//           <div className="bg-blue-600 text-white rounded-2xl px-4 py-2 max-w-[80%]">
//             <p className="text-sm">I noticed a pattern in how I understand async functions...</p>
//           </div>
//         </div>
//       </div>
      
//       <div className="p-4 border-t">
//         <div className="flex gap-2">
//           <Input placeholder="Share your insights..." className="flex-1" />
//           <Button size="icon">
//             <Send className="w-4 h-4" />
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

const SpiritJournal = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { currentStep, steps, start, next, end, isActive } = useWalkthrough();

  const startWalkthrough = () => {
    start();
  };

  const nextStep = () => {
    next();
  };

  const doneWalkthrough = () => {
    end();
  };

  const currentStepData = steps[currentStep ?? 0];

  return (
    <div className="flex relative h-[calc(100vh-64px)]">
      {/* Walkthrough Overlay and Tooltip */}
      {isActive && currentStep !== null && (
        <>
          <WalkthroughHighlight targetSelector={currentStepData.target} />
          <WalkthroughTooltip
            step={currentStepData}
            position={{ top: '50%', left: '50%' }} // Adjust position as needed
            onNext={nextStep}
            onDone={doneWalkthrough}
            isLastStep={currentStep === steps.length - 1}
          />
        </>
      )}

      {/* Sidebar */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r p-4 overflow-y-auto z-10">
        <div className="flex items-center gap-2 mb-8">
          <Brain className="w-6 h-6 text-blue-600" />
          <h1 className="font-bold text-xl">Spirit Journal</h1>
        </div>

        <div className="space-y-6">
          <Button variant="outline" className="w-full justify-start gap-2 new-entry-button">
            <Plus className="w-4 h-4" />
            New Entry
          </Button>

          <div className="space-y-2">
            <h2 className="text-sm font-medium text-gray-500">YOUR PATTERNS</h2>
            <nav className="space-y-1">
              <a className="flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-blue-50 text-blue-700">
                <Star className="w-4 h-4" />
                Recent Insights
              </a>
              <a className="flex items-center gap-2 px-3 py-2 text-sm rounded-md text-gray-600 hover:bg-gray-50">
                <Book className="w-4 h-4" />
                Learning Paths
              </a>
              <a className="flex items-center gap-2 px-3 py-2 text-sm rounded-md text-gray-600 hover:bg-gray-50">
                <Users className="w-4 h-4" />
                Shared Patterns
              </a>
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 pt-24 min-h-screen pb-32">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold mb-1">Your Learning Constellation</h1>
              <p className="text-gray-600">Mapping your journey of understanding</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Timeline
              </Button>
              <Button size="sm" onClick={startWalkthrough}>
                <Plus className="w-4 h-4 mr-2" />
                Start Walkthrough
              </Button>
            </div>
          </header>

          {/* Pattern Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {/* Active Learning Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-none active-learning-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-blue-600" />
                    Active Learning Pattern
                  </div>
                  <span className="text-sm text-blue-600">5 min ago</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">Discovery: JavaScript async patterns click when visualized as water flowing through pipes...</p>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-200" />
                    <div className="w-8 h-8 rounded-full bg-purple-200" />
                    <div className="w-8 h-8 rounded-full bg-green-200" />
                  </div>
                  <span className="text-sm text-gray-500">3 related concepts</span>
                </div>
                <Button variant="ghost" className="w-full justify-between">
                  Explore Pattern
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            {/* More Pattern Cards */}
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-gray-400" />
                      Learning Pattern {i}
                    </div>
                    <span className="text-sm text-gray-500">2d ago</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">Pattern recognition in natural learning processes...</p>
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200" />
                      <div className="w-8 h-8 rounded-full bg-gray-300" />
                    </div>
                    <span className="text-sm text-gray-500">2 related concepts</span>
                  </div>
                  <Button variant="ghost" className="w-full justify-between">
                    Explore Pattern
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Chat Toggle Button */}
      <Button
        className="fixed bottom-4 right-4 rounded-full h-12 w-12 shadow-lg z-40 bg-blue-600 hover:bg-blue-700 chat-toggle-button"
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        <MessageCircle className="w-5 h-5 text-white" />
      </Button>

      {/* Chat Dialog */}
      <ChatDialog isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default SpiritJournal;