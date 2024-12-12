'use client';
  
import { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import { User } from '../UserContext';
import { getDaysBetweenDates } from '../utils/dateDiff';
import { skipDay } from '../utils/skipDay';
// import DailyRewardPopup from '../components/DailyRewardPopup';
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
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [rewardData, setRewardData] = useState({
    daysSkipped: 0,
    aicoreIncrease: 0,
    walletIncrease: 0
  });

  const checkAndUpdateDate = async (userData: User) => {
    if (!userData) return;

    const today = new Date(new Date().setHours(0, 0, 0, 0));
    let lastLogin = userData.lastLoginDate ? new Date(userData.lastLoginDate) : new Date(new Date().setHours(0, 0, 0, 0));
    const daysDiff = getDaysBetweenDates(lastLogin, today);
    
    if (daysDiff > 0) {
      try {
        let totalAicoreIncrease = 0;
        let totalWalletIncrease = 0;

        // Get stored daily reward target
        const storedDailyReward = localStorage.getItem('selectedDailyReward');
        let dailyReward = storedDailyReward ? parseFloat(storedDailyReward) : 0;

        // Calculate total increases for all missed days
        for (let i = 0; i < daysDiff; i++) {
          const { aicoreIncrease, walletIncrease } = skipDay(userData);
          totalAicoreIncrease += aicoreIncrease;
          totalWalletIncrease += walletIncrease;

          // Compound daily reward target
          dailyReward *= (1 + 0.000633);
        }

        // Update stored daily reward with compounded value
        localStorage.setItem('selectedDailyReward', dailyReward.toFixed(1));

        // Set reward data and show popup
        setRewardData({
          daysSkipped: daysDiff,
          aicoreIncrease: totalAicoreIncrease,
          walletIncrease: totalWalletIncrease
        });
        setShowRewardPopup(true);

        // Update notifications
        const storedUnvisited = localStorage.getItem('unvisitedPages');
        const unvisitedPages = storedUnvisited ? JSON.parse(storedUnvisited) : {};
        unvisitedPages.tasks = true;
        localStorage.setItem('unvisitedPages', JSON.stringify(unvisitedPages));

        // Update user data
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

    // Validate that level and aicoreBalance are only increased
    if ((updates.level && updates.level < 0) || (updates.aicoreBalance && updates.aicoreBalance < 0)) {
      console.error('Level and aicoreBalance can only be increased with positive values');
      return { success: false, message: 'Invalid update: level and aicoreBalance must be positive' };
    }

    try {
      const updatedFields = Object.entries(updates).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          // Special handling for reinvestSetup - use set instead of increment
          if (key === 'reinvestSetup' || key === 'lastLoginDate') {
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
    showRewardPopup,
    setShowRewardPopup,
    rewardData
  };
}
