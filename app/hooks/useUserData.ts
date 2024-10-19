import { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import { User } from '../UserContext';
let cachedUser: any = null;

const initialUser: User = {
  id: '',
  telegramId: 0,
  referrerId: 0,
  username: '',
  firstName: '',
  lastName: '',
  aicoreBalance: 0,
  walletBalance: 0,
  level: 0
};

export function useUserData() {
  const [user, setUser] = useState<User | null>(initialUser);
  const [error, setError] = useState<string | null>(null);
  const [startParam, setStartParam] = useState('');

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
              cachedUser = data;
              setUser(data);
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

  const handleUpdateUser = async (updates: {
    walletBalance?: number;
    level?: number;
    aicoreBalance?: number;
  }) => {
    if (!user) return;

    try {
      const updatedFields = Object.entries(updates).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = { increment: value };
        }
        return acc;
      }, {} as Record<string, { increment: number }>);

      const res = await fetch('/api/user-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegramId: user.telegramId, updates: updatedFields }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        return { success: true, message: 'User updated successfully!' };
      } else {
        return { success: false, message: 'Failed to update user' };
      }
    } catch (err) {
      console.error(err);
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
