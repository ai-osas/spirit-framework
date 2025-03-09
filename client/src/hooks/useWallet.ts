import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<string[]>;
      on: (event: string, handler: (accounts: string[]) => void) => void;
      removeListener: (event: string, handler: (accounts: string[]) => void) => void;
    };
  }
}

// Electroneum Mainnet configuration
const ELECTRONEUM_MAINNET = {
  chainId: '0xCB5E',  // 52046 in hex
  chainName: 'Electroneum Mainnet',
  nativeCurrency: {
    name: 'Electroneum',
    symbol: 'ETN',
    decimals: 18
  },
  rpcUrls: ['https://rpc.ankr.com/electroneum'],
  blockExplorerUrls: ['https://blockexplorer.electroneum.com']
};

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check network and update state
  const checkNetwork = async () => {
    if (window.ethereum) {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const currentChainId = chainId as string;
        setCurrentNetwork(currentChainId === '0xCB5E' ? 'mainnet' : 'other');
      } catch (err) {
        console.error('Failed to get network:', err);
      }
    }
  };

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            await checkNetwork();
          }
        } catch (err) {
          console.error('Failed to check wallet connection:', err);
        }
      }
    };

    checkConnection();
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        setAccount(accounts[0] || null);
        if (accounts[0]) {
          toast({
            title: "Wallet Connected",
            description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
          });
          checkNetwork();
        }
      };

      const handleChainChanged = (_chainId: string) => {
        checkNetwork();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [toast]);

  const switchToMainnet = async () => {
    if (!window.ethereum) {
      throw new Error('Please install MetaMask');
    }

    try {
      // Try to switch to Electroneum mainnet
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xCB5E' }],
      });

      await checkNetwork();
    } catch (switchError: any) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [ELECTRONEUM_MAINNET],
          });
          await checkNetwork();
        } catch (addError) {
          console.error('Failed to add Electroneum mainnet:', addError);
          toast({
            variant: "destructive",
            title: "Network Error",
            description: "Failed to add Electroneum mainnet. Please try adding it manually.",
          });
        }
      } else {
        console.error('Failed to switch to Electroneum mainnet:', switchError);
        toast({
          variant: "destructive",
          title: "Network Error",
          description: "Failed to switch to Electroneum mainnet. Please try switching manually.",
        });
      }
    }
  };

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

      // First ensure we're on mainnet
      await switchToMainnet();

      // Then connect the wallet
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      setAccount(accounts[0]);
    } catch (err: any) {
      console.error('Failed to connect wallet:', err);
      setError('Failed to connect wallet');
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: err.message || "Failed to connect to MetaMask. Please try again.",
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
    currentNetwork,
    connect,
    disconnect,
    switchToMainnet
  };
}