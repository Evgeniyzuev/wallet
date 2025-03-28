import { useUser } from '../UserContext';

interface TaskValidationRules {
  [key: number]: {
    validate: () => Promise<boolean> | boolean;
    errorMessage: string;
  };
}

export const useTaskValidation = () => {
  const { user } = useUser();

  const validationRules: TaskValidationRules = {
    '-2': {
      validate: () => true,
      errorMessage: ''
    },
    '-1': {
      validate: () => true,
      errorMessage: ''
    },
    1: {
      validate: () => localStorage.getItem('task1Completed') === 'true',
      errorMessage: 'Please complete the desired changes survey first'
    },
    2: {
      validate: () => localStorage.getItem('selectedDailyIncome') !== null,
      errorMessage: 'Please select your desired income first'
    },
    3: {
      validate: () => localStorage.getItem('task3Completed') === 'true',
      errorMessage: 'Please complete the AI test first'
    },
    4: {
      validate: () => localStorage.getItem('task4Completed') === 'true',
      errorMessage: 'Please subscribe to the channel first'
    },
    5: {
      validate: () => (user?.level || 0) >= 3,
      errorMessage: 'This action requires level 3 or higher'
    },
    6: {
      validate: () => localStorage.getItem('task6Completed') === 'true',
      errorMessage: 'Пополните ядро минимум на 1$'
    },
    7: {
      validate: () => (user?.walletBalance || 0) >= 1,
      errorMessage: 'Wallet balance must be at least 1$'
    },
    8: {
      validate: () => {
        const daysToTarget = localStorage.getItem('calculatedDaysToTarget');
        const dailyReward = localStorage.getItem('selectedDailyReward');
        return daysToTarget !== null && dailyReward !== null;
      },
      errorMessage: 'Please calculate your path to $1M first'
    },
    13: {
      validate: () => localStorage.getItem('task13Completed') === 'true',
      errorMessage: 'Please complete the desired items test first'
    },
  };

  const isTaskEnabled = async (taskId: number) => {
    const rule = validationRules[taskId];
    if (!rule) return false;
    return await rule.validate();
  };

  const getTaskError = async (taskId: number): Promise<string | null> => {
    const rule = validationRules[taskId];
    if (!rule) return null;
    const isValid = await rule.validate();
    return isValid ? null : rule.errorMessage;
  };

  return {
    isTaskEnabled,
    getTaskError
  };
}; 