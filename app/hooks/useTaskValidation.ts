import { useUser } from '../UserContext';

interface TaskValidationRules {
  [key: number]: {
    validate: () => boolean;
    errorMessage: string;
  };
}

export const useTaskValidation = () => {
  const { user } = useUser();

  const validationRules: TaskValidationRules = {
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
      validate: () => localStorage.getItem('task2Completed') === 'true',
      errorMessage: 'Please subscribe to the channel first'
    },
    5: {
      validate: () => (user?.level || 0) >= 1,
      errorMessage: 'This action requires level 1 or higher'
    },
    6: {
      validate: () => (user?.level || 0) >= 1,
      errorMessage: 'This action requires level 1 or higher'
    },
    7: {
      validate: () => (user?.walletBalance || 0) >= 1,
      errorMessage: 'Wallet balance must be at least 1$'
    }
  };

  const isTaskEnabled = (taskId: number) => {
    const rule = validationRules[taskId];
    if (!rule) return false; // If no validation rule exists, task is disabled by default
    return rule.validate();
  };

  const getTaskError = (taskId: number): string | null => {
    const rule = validationRules[taskId];
    if (!rule || rule.validate()) return null;
    return rule.errorMessage;
  };

  return {
    isTaskEnabled,
    getTaskError
  };
}; 