import { useState } from 'react';
  
export let aicoreBalance = 0;
export const dailyCoreRate = 0.0006;
// const dailyWalletRate = 0.0003;

// export function to add aicoreBalance
export function addAicoreBalance(amount: number) {
  aicoreBalance += amount;
}
