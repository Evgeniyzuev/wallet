import React, { createContext, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { useUserData } from './hooks/useUserData';

export interface User {
  id: string;
  telegramId: number;
  referrerId?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  reinvestSetup: number;
  aicoreBalance: number;
  walletBalance: number;
  level: number;
  lastLoginDate?: Date; // Add this field
}

interface UserContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  handleUpdateUser: (updates: Partial<User>) => Promise<{ success: boolean; message: string } | undefined>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, setUser, handleUpdateUser } = useUserData();

  return (
    <UserContext.Provider value={{ user, setUser, handleUpdateUser }}>
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
