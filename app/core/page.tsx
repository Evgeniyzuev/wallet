'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import aissistImage from '../images/aissist.png';
import { useUser } from '../UserContext'; 
import { User } from '../UserContext';


export default function Core() {
  const { user, setUser, handleUpdateUser } = useUser();
  // const [aicoreBalance, setAicoreBalance] = useState(0);
  // const [walletBalance, setWalletBalance] = useState(0);
  const [dailyCoreRate] = useState(0.000633);

  // const [shouldUpdateBalance, setShouldUpdateBalance] = useState(true);

  // useEffect(() => {
  //   if (user) {
  //     setAicoreBalance(user.aicoreBalance || 0);
  //     setWalletBalance(user.walletBalance || 0);
  //     // setShouldUpdateBalance(false);
  //   }
  // }, [user]);

  const [coreAfterXyears, setCoreAfterXyears] = useState(30);
  const [reinvestmentPart, setReinvestmentPart] = useState(1);

  const handleReinvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(100, Math.max(0, parseInt(e.target.value)));
    setReinvestmentPart(value / 100);
  };

  // const currentImage = aicoreBalance > 1000 ? aissist2Image : aissistImage;
  const currentImage = aissistImage;

  const balanceRequiredForNextLevel = [
    1, 2, 4, 8, 16, 32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 
    1000000, 2000000, 4000000, 8000000, 16000000, 32000000, 64000000, 125000000, 250000000, 500000000, 
    1000000000, 2000000000, 4000000000, 8000000000, 16000000000, 32000000000, 64000000000, 125000000000, 250000000000, 500000000000
  ];
  
  const getAICoreLevel = (balance: number): number => {
    return balanceRequiredForNextLevel.findIndex(threshold => balance < threshold);
  };

  const aicoreLevel = getAICoreLevel(user?.aicoreBalance || 0);
  const nextLevelThreshold = balanceRequiredForNextLevel[aicoreLevel];
  const progressPercentage = Math.min(100, ((user?.aicoreBalance || 0) / nextLevelThreshold) * 100);

  // hook for aicore balance
  // const { aicoreBalance, setAicoreBalance } = useUserData();


  // const handleSkipYears = async () => {
  //   if (skipYears <= 0 || !user) return;

  //   // (aicoreBalance *  ((dailyCoreRate * reinvestmentPart + 1) ** 365) ** coreAfterXyears).toFixed(2)

  //   const aicoreIncrease = aicoreBalance * (((dailyCoreRate * reinvestmentPart + 1) ** 365) ** skipYears -1);
  //   const walletIncrease = aicoreBalance * (((dailyCoreRate * (1 - reinvestmentPart) + 1) ** 365) ** skipYears -1);

  //   try {
  //     const aicoreResult = await handleIncreaseAicoreBalance(aicoreIncrease);
  //     const walletResult = await handleIncreaseWalletBalance(walletIncrease);

  //     if (aicoreResult?.success && walletResult?.success) {
  //       setAicoreBalance(prevBalance => prevBalance + aicoreIncrease);
  //       setWalletBalance(prevBalance => prevBalance + walletIncrease);
  //       // setUser(prevUser => ({
  //       //   ...prevUser,
  //       //   aicoreBalance: prevUser.aicoreBalance + aicoreIncrease,
  //       //   walletBalance: prevUser.walletBalance + walletIncrease
  //       // }));
  //       alert(`Successfully skipped ${skipYears} years. Aicore balance increased by ${aicoreIncrease.toFixed(2)} and Wallet balance increased by ${walletIncrease.toFixed(2)}`);
  //     } else {
  //       alert('Failed to update balances');
  //     }
  //   } catch (error) {
  //     console.error('Error updating balances:', error);
  //     alert('An error occurred while updating balances');
  //   }
  //   setskipYears(0);
  // };

  const handleSkipDay = async () => {
    if (!user) return;

    try {
      const aicoreIncrease = user.aicoreBalance * (dailyCoreRate * reinvestmentPart);
      const walletIncrease = user.aicoreBalance * (dailyCoreRate * (1 - reinvestmentPart));
      
      // Implement these functions in your UserContext or as API calls
      // const walletResult = await handleIncreaseWalletBalance(walletIncrease);
      // const aicoreResult = await handleIncreaseAicoreBalance(aicoreIncrease);
      await handleUpdateUser({
        walletBalance: walletIncrease,  // Increase wallet balance by 10
        aicoreBalance: aicoreIncrease,   // Increase aicore balance by 5
        level: 0            // Increase level by 1
      });


      // if (result?.success) {
      //   console.log('Successfully skipped 1 day. Aicore balance increased by', aicoreIncrease.toFixed(2), 'and Wallet balance increased by', walletIncrease.toFixed(2));
      // } else {
      //   console.log('Failed to update balances');
      // }
    } catch (error) {
      console.error('Error updating balances:', error);
      alert('An error occurred while updating balances');
    }
  };

  return (
    <main className="bg-[#1c2033] text-white min-h-screen flex flex-col">
      <div className="h-1/2 flex items-center justify-center overflow-hidden relative">
      <Image src={currentImage} alt="AI Assistant" className="w-full h-full object-cover" />
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center">
          <div className="relative w-80 h-4 bg-gray-700 bg-opacity-50 rounded-full overflow-hidden mr-2">
            <div
              className="absolute top-0 left-0 h-full bg-yellow-500 bg-opacity-50"
              style={{ width: `${progressPercentage}%` }}
            >
              {/* <div className="absolute inset-0 flex items-center justify-center text-xs text-black font-bold">
                {Math.floor(progressPercentage)}%
              </div> */}
            </div>
            <div className="absolute inset-0 flex items-center justify-center text-xs text-white">
            {Math.floor((user?.aicoreBalance || 0) * 100) / 100} USD / {balanceRequiredForNextLevel[aicoreLevel]} USD 
            </div>
          </div>
          <div className="text-yellow-500 border border-yellow-500 rounded-full w-8 h-8 flex items-center justify-center">
            {aicoreLevel}
          </div>
        </div>
      </div>
      <div className="mb-1 mt-5">APY 26%: {((user?.aicoreBalance || 0) * dailyCoreRate * (reinvestmentPart)).toFixed(2)} USD/day</div>
            <div className="mb-1 flex items-center">
              <span className="mr-2">Reinvest</span>
              <input
                autoComplete="off"
                type="number"
                value={Math.round(reinvestmentPart * 100)}
                onChange={handleReinvestmentChange}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.value.length > 3) {
                    target.value = target.value.slice(0, 3);
                  }
                  if (parseInt(target.value) > 100) {
                    target.value = '100';
                  }
                }}
                className="w-11 h-6 p-1 border border-black text-black rounded"
                min="0"
                max="100"
              />
              <span className="ml-1">% </span>
              <div 
                className="w-40 h-4 bg-gray-200 rounded-full overflow-hidden mr-2"
              >
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${reinvestmentPart * 100}%` }}
                ></div>
              </div>

              
            </div>
            <div className="mb-1">Core to wallet: {((user?.aicoreBalance || 0) * dailyCoreRate * (1 - reinvestmentPart)).toFixed(2)} USD/day</div>
            <div className="mb-1">Wallet: {Math.floor((user?.walletBalance || 0) * 100) / 100} USD</div>
            {/* <div className="mb-1">Core after {coreAfterXyears} years without replenishment:</div>
            <div className="mb-1"> {(aicoreBalance *  ((dailyCoreRate * reinvestmentPart + 1) ** 365) ** coreAfterXyears).toFixed(2)} USD</div> */}
            <div className="mb-1 flex items-center">
              <span className="mr-0">Core after</span>
              <input
                type="number"
                value={coreAfterXyears}
                onChange={(e) => setCoreAfterXyears(Math.min(99, Math.max(0, parseInt(e.target.value) )))}
                className="w-11 h-6 p-1 border border-black text-black rounded mx-1"
                min="1"
                max="99"
              />
              <span>years without repl:</span>
            </div>
            <div className="mb-1"> {((user?.aicoreBalance || 0) *  ((dailyCoreRate * reinvestmentPart + 1) ** 365.25) ** coreAfterXyears).toFixed(2)} USD</div>
            <button onClick={handleSkipDay} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Skip 1 day</button>

    </main>
  );
}
