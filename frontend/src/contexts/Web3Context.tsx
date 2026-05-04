import { Web3ContextType } from '../types';
import React, { createContext, useState, useEffect, ReactNode } from 'react';

export const Web3Context = createContext<Web3ContextType | undefined>(undefined);

interface Web3ProviderProps {
  children: ReactNode;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkMetaMaskInstalled = (): boolean => {
    if (typeof window === 'undefined') return false;

    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install MetaMask extension.');
      console.error('MetaMask non détecté');
      return false;
    }
    return true;
  };

  useEffect(() => {
    // Vérifier si MetaMask est installé
    if (checkMetaMaskInstalled()) {
      // Écouter les changements de compte
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      checkConnection();
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (!checkMetaMaskInstalled()) return;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) {
        const chain = await window.ethereum.request({ method: 'eth_chainId' });
        setAccount(accounts[0]);
        setChainId(parseInt(chain, 16));
        setIsConnected(true);
        setError(null);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setError('Failed to check wallet connection');
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount(null);
      setIsConnected(false);
    } else {
      setAccount(accounts[0]);
      setIsConnected(true);
    }
  };

  const handleChainChanged = (chainIdHex: string) => {
    setChainId(parseInt(chainIdHex, 16));
    window.location.reload();
  };

  const connectWallet = async () => {
    // Vérification importante avant de continuer
    if (!checkMetaMaskInstalled()) {
      // Ouvrir le lien d'installation de MetaMask
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Demander l'accès aux comptes
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Récupérer le chain ID
      const chain = await window.ethereum.request({ method: 'eth_chainId' });

      setAccount(accounts[0]);
      setChainId(parseInt(chain, 16));
      setIsConnected(true);

      // Vérifier si on est sur le bon réseau
      const currentChainId = parseInt(chain, 16);
      if (currentChainId !== 43113) {
        // Fuji Testnet
        setError('Please switch to Avalanche Fuji Testnet');
        await switchToAvalancheNetwork();
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      setError(error.message || 'Failed to connect wallet');
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToAvalancheNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xA869' }], // 43113 en hex
      });
    } catch (switchError: any) {
      // Si le réseau n'existe pas, l'ajouter
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xA869',
                chainName: 'Avalanche Fuji Testnet',
                nativeCurrency: {
                  name: 'AVAX',
                  symbol: 'AVAX',
                  decimals: 18,
                },
                rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
                blockExplorerUrls: ['https://testnet.snowtrace.io/'],
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add network:', addError);
        }
      }
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setError(null);
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        chainId,
        connectWallet,
        disconnectWallet,
        isConnected,
        isConnecting,
        error,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
