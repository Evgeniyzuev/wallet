export interface Task {
  taskId: number;
  title: string;
  image: string;
  description: string;
  reward: number;
  actionText: string;
  action: () => void;
  secondActionText: string;
  secondAction: (user: any, handleUpdateUser: any, setNotification: any, setTaskCompleted: any, setError: any) => void;
}



export const tasks: Task[] = [
    {
        taskId: 1,
        title: 'Open Bot',
        image: '/images/core-xs.jpg',
        description: 'Open the bot',
        reward: 1,
        actionText: 'Do it',
        action: () => {
            window.open('https://t.me/WeAiBot_bot', '_blank');
        },
        secondActionText: 'Done',   
        secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {
          // const taskId = this.taskId;
            await completeTask(this.taskId, this.reward, user, handleUpdateUser, setNotification, setTaskCompleted, setError);
        },
    },
  {
    taskId: 2,
    title: 'Subscribe to the channel',
    image: '/images/core-xs.jpg',
    description: 'Subscribe to the WeAi channel',
    reward: 1,
    actionText: 'Subscribe',
    action: () => {
      window.open('https://t.me/WeAi_ch', '_blank');
    },
    secondActionText: 'Check Membership',
    secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {
        const isMember = await checkMembership(user, 'WeAi_ch', setError);
        if (isMember) {
          await completeTask(this.taskId, this.reward, user, handleUpdateUser, setNotification, setTaskCompleted, setError);
        } else {
            setError('Please subscribe to the channel to receive the bonus');
        }
    }
  },
  // Add more tasks here as needed, each with their own action and secondAction
  // 3 обучение тест
  // 4 пополнить кошелек
  // 5 качнуть ядро
  // 6 получить код у ассистента
  // 7 определить размер убд для: 1безопасности 2независимости 3свободы
  {
    taskId: 3,
    title: 'Learning test',
    image: '/images/brain.jpg',
    description: 'Pass the learning test',
    reward: 1,
    actionText: 'Do it',
    action: () => {
      window.open('https://t.me/WeAi_ch', '_blank');
    },  
    secondActionText: 'Done',
    secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {
        await completeTask(this.taskId, this.reward, user, handleUpdateUser, setNotification, setTaskCompleted, setError);
    },
  },
  {
    taskId: 4,
    title: 'Top up the wallet',
    image: '/images/top_wallet.jpg',
    description: 'Top up the wallet',
    reward: 1,
    actionText: 'Do it',
    action: () => {
      window.open('https://t.me/WeAi_ch', '_blank');
    },
    secondActionText: 'Done',
    secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {
        await completeTask(this.taskId, this.reward, user, handleUpdateUser, setNotification, setTaskCompleted, setError);
    },
  },
  {
    taskId: 5,
    title: 'Upgrade the core',
    image: '/images/core-xs.jpg',
    description: 'Upgrade the core',
    reward: 1,  
    actionText: 'Do it',
    action: () => {
      window.open('https://t.me/WeAi_ch', '_blank');
    },
    secondActionText: 'Done',
    secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {
      await completeTask(this.taskId, this.reward, user, handleUpdateUser, setNotification, setTaskCompleted, setError);
    },
  },
  {
    taskId: 6,
    title: 'Get the code from the assistant',
    image: '/images/cyber.png',
    description: 'Get the code from the assistant',
    reward: 1,
    actionText: 'Do it',
    action: () => {
      window.open('https://t.me/WeAi_ch', '_blank');
    },
    secondActionText: 'Done',
    secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {

      await completeTask(this.taskId, this.reward, user, handleUpdateUser, setNotification, setTaskCompleted, setError);
    },
  },
  {
    taskId: 7,
    title: 'Determine the size of the UBI',
    image: '/images/core-xs.jpg',
    description: 'Determine the size of the UBI for: 1. safety 2. independence 3. freedom',
    reward: 1,
    actionText: 'Do it',  
    action: () => {
      window.open('https://t.me/WeAi_ch', '_blank');
    },
    secondActionText: 'Done',
    secondAction: async function(user, handleUpdateUser, setNotification, setTaskCompleted, setError) {
      await completeTask(this.taskId, this.reward, user, handleUpdateUser, setNotification, setTaskCompleted, setError);
    },
  }
];

export const handleSubscribe = async () => {
  window.open('https://t.me/WeAi_ch', '_blank');
};

export const checkMembership = async (user: any, channelUsername: string,  setError: any) => {
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
      return true
    } else {
      setError('Please subscribe to the channel to receive the bonus');
      return false
    }
  } else {
    setError('Failed to check membership');
  }
};

export const completeTaskApi = async (telegramId: number, taskId: number) => {
    if (!telegramId) {
        console.error('User or telegramId is undefined');
        return false;
    }
    const response = await fetch('/api/complete-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            telegramId: telegramId,
            taskId: taskId
        }),
    })
    if (response.ok) {
        const { success } = await response.json();
        return success;
    } else {
        return false;
    }
}

const completeTask = async (
  taskId: number,
  reward: number,
  user: any,
  handleUpdateUser: any,
  setNotification: any,
  setTaskCompleted: any,
  setError: any
) => {
  setTaskCompleted(true);
  
  if (!user?.telegramId) {
    setError('User not found');
    return;
  }

  const result = await handleUpdateUser({ aicoreBalance: reward });
  const result2 = await completeTaskApi(user.telegramId, taskId);

  if (result?.success) {
    setNotification(`Task completed! ${reward}$ added to your Aicore.`);
  } else {
    setError('Failed to increase Aicore balance');
  }
};
