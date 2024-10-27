import { User } from '../UserContext';

export const skipDay = (user: User): { aicoreIncrease: number; walletIncrease: number } => {
  if (!user) {
    throw new Error('No user found');
  }

  const reinvestSetup = user.reinvestSetup;
  const dailyCoreRate = 0.000633;

  // Calculate increases
  const aicoreIncrease = user.aicoreBalance * (dailyCoreRate * reinvestSetup / 100);
  const walletIncrease = user.aicoreBalance * (dailyCoreRate * (1 - reinvestSetup / 100));

  return {
    aicoreIncrease,
    walletIncrease
  };
};
