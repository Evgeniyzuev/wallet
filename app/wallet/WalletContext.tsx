import { createContext, useContext, useState } from 'react';

interface WalletContextType {
  tonconnectAddress: string;
  setTonconnectAddress: (address: string) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [tonconnectAddress, setTonconnectAddress] = useState('');

  return (
    <WalletContext.Provider value={{ tonconnectAddress, setTonconnectAddress }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
