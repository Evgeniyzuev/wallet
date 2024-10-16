import React, { createContext, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { useUserData } from './hooks/useUserData';

export interface User {
  id: string;
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  aicoreBalance: number;
  walletBalance: number;
}

interface UserContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  handleIncreaseAicoreBalance: (amount: number) => Promise<{ success: boolean; message: string } | undefined>;
  handleIncreaseWalletBalance: (amount: number) => Promise<{ success: boolean; message: string } | undefined>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, setUser, handleIncreaseAicoreBalance, handleIncreaseWalletBalance } = useUserData();

  return (
    <UserContext.Provider value={{ user, setUser, handleIncreaseAicoreBalance, handleIncreaseWalletBalance }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
