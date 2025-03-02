import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import SpiritJournal from '@/components/SpiritJournal';

export default function JournalPage() {
  const { account } = useWallet();

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
        <h1 className="text-2xl font-semibold">Connect Your Wallet</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Please connect your wallet using the button in the navigation bar to access your journal.
        </p>
      </div>
    );
  }

  return <SpiritJournal />;
}