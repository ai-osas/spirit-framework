// src/app/journal/[id]/page.tsx
'use client';

import JournalEntry from '@/components/JournalEntry';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function JournalEntryPage({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <JournalEntry id={params.id} />
    </ProtectedRoute>
  );
}