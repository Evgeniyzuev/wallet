'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import aissistImage from './images/aissist.png';
import aissist2Image from './images/aissist2.png';
import { useUserData } from './hooks/useUserData';
import Navigation from './components/Navigation'

export default function Home() {
  const { user, setUser } = useUserData();
  const [aicoreBalance, setAicoreBalance] = useState(0);
  const [dailyCoreRate] = useState(0.0006);

  useEffect(() => {
    if (user) {
      setAicoreBalance(user.aicoreBalance);
    }
  }, [user]);

  const [coreAfterXyears, setCoreAfterXyears] = useState(30);
  const [reinvestmentPart, setReinvestmentPart] = useState(0.3);

  const handleReinvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(100, Math.max(0, parseInt(e.target.value)));
    setReinvestmentPart(value / 100);
  };

  const currentImage = aicoreBalance > 1000 ? aissist2Image : aissistImage;
  // const currentImage = aissistImage;

  const balanceRequiredForNextLevel = [1, 2, 4, 8, 16, 32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000];
  
  const getAICoreLevel = (balance: number): number => {
    return balanceRequiredForNextLevel.findIndex(threshold => balance < threshold);
  };

  const aicoreLevel = getAICoreLevel(aicoreBalance);
  const nextLevelThreshold = balanceRequiredForNextLevel[aicoreLevel];
  const progressPercentage = Math.min(100, (aicoreBalance / nextLevelThreshold) * 100);

  // hook for aicore balance
  // const { aicoreBalance, setAicoreBalance } = useUserData();


  return (
    // <main className="text-base flex flex-col items-center self-start w-full p-4">
    <main className="bg-black text-white h-screen flex flex-col">
      {/* <Image src={aissistImage} alt="Aissist" className="mb-8" />
      <h1 className="text-4xl font-bold mb-8">Aissist</h1> */}
      <div className="h-1/2 flex items-center justify-center overflow-hidden relative">
      <Image src={currentImage} alt="AI Assistant" className="w-full h-full object-cover" />
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center">
          <div className="relative w-80 h-4 bg-gray-700 bg-opacity-50 rounded-full overflow-hidden mr-2">
            <div
              className="absolute top-0 left-0 h-full bg-yellow-500 bg-opacity-50"
              style={{ width: `${progressPercentage}%` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center text-xs text-white">
              {aicoreBalance.toFixed(2)} USD / {balanceRequiredForNextLevel[aicoreLevel]} USD
            </div>
          </div>
          <div className="text-yellow-500 border border-yellow-500 rounded-full w-8 h-8 flex items-center justify-center">
            {aicoreLevel}
          </div>
        </div>
      </div>
      <div className="mb-1 mt-5">APY 24,5%: {(aicoreBalance * dailyCoreRate).toFixed(2)} USD/day</div>
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
            <div className="mb-1">Core to wallet: {(aicoreBalance * dailyCoreRate * (1 - reinvestmentPart)).toFixed(2)} USD/day</div>
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
              <span>years without replenishment:</span>
            </div>
            <div className="mb-1"> {(aicoreBalance *  ((dailyCoreRate * reinvestmentPart + 1) ** 365) ** coreAfterXyears).toFixed(2)} USD</div>


            <Navigation />
    </main>
  );
}