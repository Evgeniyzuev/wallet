'use client';
  
import { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import { User } from '../UserContext';
import { getDaysBetweenDates } from '../utils/dateDiff';
import { skipDay } from '../utils/skipDay';
let cachedUser: any = null;

const initialUser: User = {
  id: '',
  telegramId: 0,
  referrerId: 0,
  username: '',
  firstName: '',
  lastName: '',
  reinvestSetup: 100,
  aicoreBalance: 0,
  walletBalance: 0,
  level: 0,
  lastLoginDate: new Date()
};

export function useUserData() {
  const [user, setUser] = useState<User | null>(initialUser);
  const [error, setError] = useState<string | null>(null);
  const [startParam, setStartParam] = useState('');

  const checkAndUpdateDate = async (userData: User) => {
    if (!userData) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to 00:00:00
    
    let lastLogin = userData.lastLoginDate ? new Date(userData.lastLoginDate) : new Date();
    lastLogin.setHours(0, 0, 0, 0); // Reset time to 00:00:00

    const daysDiff = getDaysBetweenDates(lastLogin, today);
    
    if (daysDiff > 0) {
      try {
          let totalAicoreIncrease = 0;
          let totalWalletIncrease = 0;

          // Calculate total increases for all missed days
          for (let i = 0; i < daysDiff; i++) {
            const { aicoreIncrease, walletIncrease } = skipDay(userData);
            totalAicoreIncrease += aicoreIncrease;
            totalWalletIncrease += walletIncrease;
          }

          // Make a single update with the total increases
          await handleUpdateUser({
            aicoreBalance: totalAicoreIncrease,
            walletBalance: totalWalletIncrease,
            lastLoginDate: today
          });        

      } catch (error) {
        console.error('Error updating login date:', error);
      }
    }
  };

  useEffect(() => {
    if (cachedUser) return;

    if (typeof window !== 'undefined') {
      const tg = WebApp;
      tg.ready();

      const initDataUnsafe = tg.initDataUnsafe || {};
      setStartParam(WebApp.initDataUnsafe.start_param || '');

      if (initDataUnsafe.user) {
        fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user: initDataUnsafe.user,
            start_param: initDataUnsafe.start_param
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              setError(data.error);
            } else {
              if (typeof window !== 'undefined') {
                // код, использующий window
                cachedUser = data;
                setUser(data);
              }

            }
          })
          .catch((err) => {
            console.error(err);
            setError('Failed to fetch user data');
          });
      } else {
        setError('No user data available');
      }
    } else {
      setError('This app should be opened in Telegram');
    }
  }, []);

  useEffect(() => {
    if (user && user.telegramId !== 0) {
      checkAndUpdateDate(user);
    }
  }, [user?.telegramId]);

  const handleUpdateUser = async (updates: {
    walletBalance?: number;
    level?: number;
    aicoreBalance?: number;
    reinvestSetup?: number;
    lastLoginDate?: Date;
  }) => {
    if (!user) return;

    try {
      const updatedFields = Object.entries(updates).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          // Special handling for reinvestSetup - use set instead of increment
          if (key === 'reinvestSetup') {
            acc[key] = value; // Direct value
          } else {
            acc[key] = { increment: value }; // Increment for other fields
          }
        }
        return acc;
      }, {} as Record<string, any>);

      console.log('Sending update to API:', updatedFields);

      const apiUrl = `${window.location.origin}/api/user-update`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          telegramId: user.telegramId, 
          updates: updatedFields 
        }),
      });

      const data = await res.json();
      console.log('API response:', data);

      if (data.success) {
        setUser(data.user);
        return { success: true, message: 'User updated successfully!' };
      } else {
        return { success: false, message: data.error || 'Failed to update user' };
      }
    } catch (err) {
      console.error('Error in handleUpdateUser:', err);
      return { success: false, message: 'An error occurred while updating user' };
    }
  };

  return {
    user,
    setUser: (newUser: any) => {
      cachedUser = newUser;
      setUser(newUser);
    },
    error,
    setError,
    handleUpdateUser,
  };
}
