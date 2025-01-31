// src/app/journal/new/page.tsx
"use client";

import JournalEntry from '@/components/JournalEntry';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function NewJournalEntryPage() {
  return (
    <ProtectedRoute>
      <JournalEntry />
    </ProtectedRoute>
  );
}
