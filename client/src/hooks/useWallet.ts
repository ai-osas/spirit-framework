import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<string[]>;
      on: (event: string, handler: (accounts: string[] | string) => void) => void;
      removeListener: (event: string, handler: (accounts: string[] | string) => void) => void;
    };
  }
}

const ELECTRONEUM_MAINNET_CHAIN_ID = '0x4f5fed';  // 5201421 in hex

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Handle network changes
  useEffect(() => {
    if (window.ethereum) {
      const handleChainChanged = (chainId: string) => {
        // Clear connection if not on Electroneum mainnet
        if (chainId !== ELECTRONEUM_MAINNET_CHAIN_ID) {
          setAccount(null);
          toast({
            variant: "destructive",
            title: "Network Changed",
            description: "Please connect to Electroneum mainnet to continue.",
          });
        }
      };

      window.ethereum.on('chainChanged', handleChainChanged);

      // Check current network on mount
      window.ethereum.request({ method: 'eth_chainId' })
        .then((chainId) => {
          if (chainId !== ELECTRONEUM_MAINNET_CHAIN_ID) {
            setAccount(null);
          }
        })
        .catch(console.error);

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [toast]);

  // Handle account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setAccount(null);
          toast({
            title: "Wallet Disconnected",
            description: "Your wallet has been disconnected",
          });
        } else {
          setAccount(accounts[0]);
          toast({
            title: "Wallet Connected",
            description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
          });
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [toast]);

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        } catch (err) {
          console.error('Failed to check wallet connection:', err);
        }
      }
    };

    checkConnection();
  }, []);

  const connect = async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please install MetaMask to continue",
      });
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      // First check if we're on the right network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== ELECTRONEUM_MAINNET_CHAIN_ID) {
        setAccount(null);
        toast({
          variant: "destructive",
          title: "Wrong Network",
          description: "Please switch to Electroneum mainnet in your wallet",
        });
        return;
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      setAccount(accounts[0]);
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError('Failed to connect wallet');
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Failed to connect to MetaMask. Please try again.",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  return {
    account,
    isConnecting,
    error,
    connect,
    disconnect
  };
}