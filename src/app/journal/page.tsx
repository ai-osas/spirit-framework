// src/app/journal/page.tsx
"use client";

import SpiritJournal from '@/components/SpiritJournal';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { WalkthroughProvider } from '@/components/walkthrough/WalkthroughProvider';

export default function JournalPage() {
  return (
    <ProtectedRoute>
      <WalkthroughProvider>
        <SpiritJournal />
      </WalkthroughProvider>
    </ProtectedRoute>
  );
}