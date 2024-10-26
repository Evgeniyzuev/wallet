import { User } from '../UserContext';

interface SkipDayResult {
  success: boolean;
  error?: string;
}

export const skipDay = async (
  user: User,
  handleUpdateUser: (updates: Partial<User>) => Promise<{ success: boolean; message: string } | undefined>,
): Promise<SkipDayResult> => {
  if (!user) {
    return { success: false, error: 'No user found' };
  }

  const reinvestSetup = user.reinvestSetup;
  const dailyCoreRate = 0.000633;

  try {
    // Calculate increases
    const aicoreIncrease = user.aicoreBalance * (dailyCoreRate * reinvestSetup / 100);
    const walletIncrease = user.aicoreBalance * (dailyCoreRate * (1 - reinvestSetup / 100));

    // Update balances
    const result = await handleUpdateUser({
      walletBalance: walletIncrease,
      aicoreBalance: aicoreIncrease,
      level: 0
    });

    return {
      success: result?.success || false,
      error: result?.success ? undefined : 'Failed to update balances'
    };
  } catch (error) {
    console.error('Error in skipDay:', error);
    return {
      success: false,
      error: 'An error occurred while updating balances'
    };
  }
};
