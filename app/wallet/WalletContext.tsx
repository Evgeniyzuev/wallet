import { createContext, useContext, useState } from 'react';

interface WalletContextType {
  tonConnectAddress: string | null;
  setTonConnectAddress: (address: string | null) => void;
}

const WalletContext = createContext<WalletContextType>({
  tonConnectAddress: null,
  setTonConnectAddress: () => {},
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [tonConnectAddress, setTonConnectAddress] = useState<string | null>(null);

  return (
    <WalletContext.Provider value={{ tonConnectAddress, setTonConnectAddress }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
