// src/app/journal/page.tsx
"use client";

import SpiritJournal from '@/components/SpiritJournal';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function JournalPage() {
  return (
    <ProtectedRoute>
      <SpiritJournal />
    </ProtectedRoute>
  );
}