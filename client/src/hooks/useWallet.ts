import { useState, useEffect } from 'react';

interface Window {
  ethereum?: any;
}

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setAccount(accounts[0] || null);
      });
    }
  }, []);

  const connect = async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      setAccount(accounts[0]);
    } catch (err) {
      setError('Failed to connect wallet');
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
  };

  return {
    account,
    isConnecting,
    error,
    connect,
    disconnect
  };
}
