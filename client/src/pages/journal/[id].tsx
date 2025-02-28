import { useParams } from 'wouter';
import JournalEntry from '@/components/JournalEntry';

export default function EditJournalPage() {
  const { id } = useParams();
  return <JournalEntry id={id} />;
}
