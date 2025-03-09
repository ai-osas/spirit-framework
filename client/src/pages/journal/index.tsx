import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import SpiritJournal from '@/components/SpiritJournal';
import { Link } from 'wouter';
import { Loader2 } from 'lucide-react';

export default function JournalPage() {
  const { account, connect, isConnecting } = useWallet();

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
        <h1 className="text-2xl font-semibold">Connect Your Wallet</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Please connect your Web3 wallet to access Spirit Journal on Electroneum mainnet.
        </p>
        <Button onClick={connect} disabled={isConnecting} className="flex items-center gap-2">
          {isConnecting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      </div>
    );
  }

  return <SpiritJournal />;
}