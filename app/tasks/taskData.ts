

export interface Task {
  title: string;
  image: string;
  description: string;
  reward: string;
  actionText: string;
  action: () => void;
  secondActionText: string;
  secondAction: (user: any, handleIncreaseAicoreBalance: any, setNotification: any, setTaskCompleted: any, setIsPopupOpen: any, setError: any) => void;
}

export const tasks: Task[] = [
    {
        title: 'Test task',
        image: '/images/core-xs.jpg',
        description: 'Test me',
        reward: '+1 $',
        actionText: 'Do it',
        action: () => {
            window.open('https://t.me/WeAi_ch', '_blank');
        },
        secondActionText: 'Done',   
        secondAction: async (user, handleIncreaseAicoreBalance, setNotification, setTaskCompleted, setIsPopupOpen, setError) => {
            if (!user?.telegramId) {
                setError('User not found');
                return;
              }
            const result = await handleIncreaseAicoreBalance(1);
            if (result?.success) {
              setNotification('Subscription successful! 1 Aicore added to your balance.');
              setTaskCompleted(true);
              setIsPopupOpen(false);
            } else {
                setError('Failed to increase Aicore balance');
            }
        },
    },
  {
    title: 'Subscribe to the channel',
    image: '/images/core-xs.jpg',
    description: 'Subscribe to the WeAi channel',
    reward: '+0,5 $',
    actionText: 'Subscribe',
    action: () => {
      window.open('https://t.me/WeAi_ch', '_blank');
    },
    secondActionText: 'Check Membership',
    secondAction: async (user, handleIncreaseAicoreBalance, setNotification, setTaskCompleted, setIsPopupOpen, setError) => {
      if (!user?.telegramId) {
        setError('User not found');
        return;
      }
      const isMember = await checkMembership(user, 'WeAi_ch', handleIncreaseAicoreBalance, setError)
        if (isMember) {
          const result = await handleIncreaseAicoreBalance(0.5);
          if (result?.success) {
            setNotification('Subscription successful! 0.5 Aicore added to your balance.');
            setTaskCompleted(true);
            setIsPopupOpen(false);
          } else {
            setError('Failed to increase Aicore balance');
          }
        } else {
          setError('Please subscribe to the channel to receive the bonus');
        }

    }
  },
  // Add more tasks here as needed, each with their own action and secondAction
];

export const handleSubscribe = async () => {
  window.open('https://t.me/WeAi_ch', '_blank');
};

export const checkMembership = async (user: any, channelUsername: string, handleIncreaseAicoreBalance: any, setError: any) => {
  if (!user?.telegramId) {
    setError('User not found');
    return;
  }
  const response = await fetch('/api/check-membership', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      telegramId: user.telegramId,
      channelUsername: channelUsername
    }),
  });

  if (response.ok) {
    const { isMember } = await response.json();
    if (isMember) {
      const result = await handleIncreaseAicoreBalance(0.5);
      if (result?.success) {
        return true
      } else {
        setError('Failed to increase Aicore balance');
        return false
      }
    } else {
      setError('Please subscribe to the channel to receive the bonus');
      return false
    }
  } else {
    setError('Failed to check membership');
  }
};
