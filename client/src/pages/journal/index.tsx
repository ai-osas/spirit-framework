import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import SpiritJournal from '@/components/SpiritJournal';
import { Link } from 'wouter';

export default function JournalPage() {
  const { account, connect, isConnecting } = useWallet();

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
        <h1 className="text-2xl font-semibold">Connect Your Wallet</h1>
        <p className="text-muted-foreground text-center max-w-md">
          To access your journal entries and start writing, please connect your Web3 wallet.
        </p>
        <Button onClick={connect} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      </div>
    );
  }

  return <SpiritJournal />;
}