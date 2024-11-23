import { createContext, useContext, useState } from 'react';

interface WalletContextType {
  tonWalletAddress: string | null;
  setTonWalletAddress: (address: string | null) => void;
}

const WalletContext = createContext<WalletContextType>({
  tonWalletAddress: null,
  setTonWalletAddress: () => {},
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [tonWalletAddress, setTonWalletAddress] = useState<string | null>(null);

  return (
    <WalletContext.Provider value={{ tonWalletAddress, setTonWalletAddress }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
