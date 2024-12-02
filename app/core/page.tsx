'use client'

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import aissistImage from '../images/aissist0.png';
import { useUser } from '../UserContext'; 
import { useUserData } from '../hooks/useUserData'; 
import DailyRewardPopup from '../components/DailyRewardPopup';
import LevelUpPopup from '../components/LevelUpPopup';


export default function Core() {
  const { 
    user, 
    handleUpdateUser, 
  } = useUser();

  const {
    showRewardPopup, 
    setShowRewardPopup, 
    rewardData 
  } = useUserData();


  const [dailyCoreRate] = useState(0.000633);
  const [coreAfterXyears, setCoreAfterXyears] = useState(30);
  const [reinvestmentPart, setReinvestmentPart] = useState(1);
  const [dailyReward, setDailyReward] = useState(1);
  const [dailyRewardInput, setDailyRewardInput] = useState('1');
  const [targetAmount, setTargetAmount] = useState(0);
  const [daysToTarget, setDaysToTarget] = useState(0);
  const [plusStartCore, setPlusStartCore ] = useState(0);
  const [reinvestmentSetupInput, setReinvestmentSetupInput] = useState<number>(0); // Track input value
  const [isSaved, setIsSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isTransactionInProgress, setIsTransactionInProgress] = useState(false);

  // const previousLevelRef = useRef(user?.level); // Создаем реф для хранения предыдущего уровня

  const handleReinvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(100, Math.max(0, parseInt(e.target.value)));
    setReinvestmentPart(value / 100);
  };
  const handleDailyRewardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 999) {
      setDailyReward(value);
    }
  };


  const currentImage = aissistImage;

  const balanceRequiredForNextLevel = [
    2, 4, 8, 16, 32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 
    1000000, 2000000, 4000000, 8000000, 16000000, 32000000, 64000000, 125000000, 250000000, 500000000, 
    1000000000, 2000000000, 4000000000, 8000000000, 16000000000, 32000000000, 64000000000, 125000000000, 250000000000, 500000000000
  ];
  
  const getAICoreLevel = (balance: number): number => {
    return balanceRequiredForNextLevel.findIndex(threshold => balance < threshold);
  };

  const aicoreLevel = getAICoreLevel(user?.aicoreBalance || 0);
  const nextLevelThreshold = balanceRequiredForNextLevel[aicoreLevel];
  const progressPercentage = Math.min(100, ((user?.aicoreBalance || 0) / nextLevelThreshold) * 100);



  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [amount, setAmount] = useState('');

  const handleButtonClick = (action: string) => {
    (selectedAction === action)?setSelectedAction(null):setSelectedAction(action);
    setAmount('');
  };

  const handleActionSubmit = async () => {
    if (isTransactionInProgress) {
      console.error('Transaction already in progress');
      return; // Prevent further actions if a transaction is in progress
    }

    if (!amount || isNaN(Number(amount))) {
      console.error('Invalid amount');
      return;
    }

    const amountNumber = Number(amount);

    if (amountNumber > (user?.walletBalance || 0)) {
      console.error('Insufficient balance');
      return;
    }

    try {
      setIsTransactionInProgress(true); // Set the transaction in progress state
      const result = await handleUpdateUser({
        walletBalance: -amountNumber,
        aicoreBalance: amountNumber
      });

      if (result?.success) {
        console.log('Successfully updated core balance');
        setSelectedAction(null);
      } else {
        console.error('Failed to update core balance');
      }
    } catch (error) {
      console.error('Error updating core balance:', error);
    } finally {
      setIsTransactionInProgress(false); // Reset the transaction state
    }
  };

  const handleSaveReinvestSetup = async () => {
    if (!user) {
      console.log('No user found');
      return;
    }

    // Ensure value is within bounds
    let finalValue = reinvestmentSetupInput;
    if (finalValue < minValue) finalValue = minValue;
    else if (finalValue > 100) finalValue = 100;

    console.log('Current user reinvestSetup:', user.reinvestSetup);
    console.log('New reinvestSetup value:', finalValue);

    try {
      const result = await handleUpdateUser({
        reinvestSetup: finalValue // Send the actual value, not the difference
      });
      
      console.log('API response:', result);

      if (result?.success) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
        console.log('Successfully updated reinvest setup');
      } else {
        console.error('Failed to update reinvest setup:', result);
      }
    } catch (error) {
      console.error('Error in handleSaveReinvestSetup:', error);
    }
  };

  const minValue = 100 - aicoreLevel * 5; // Calculate minValue

  const calculateDaysToTarget = () => {
    if (!user) return;

    let minDays = 0;
    let maxDays = 16384;

    const recursiveCalculate = (minDays: number, maxDays: number) => {
      const days = Math.floor((minDays + maxDays) / 2);
      const currentAmount = (user.aicoreBalance + plusStartCore + dailyReward * days) * ((dailyCoreRate * reinvestmentPart + 1) ** days);


      // Base case: if the difference is small enough
      if (-2 < maxDays - minDays && maxDays - minDays < 2) {
        setDaysToTarget(days);
        return;
      }

      // Adjust the search range based on the current amount
      if (currentAmount < targetAmount) {
        recursiveCalculate(days, maxDays); // Increase days
      } else {
        recursiveCalculate(minDays, days); // Decrease days
      }
    };

    recursiveCalculate(minDays, maxDays);
  };

  useEffect(() => {
    const handleFocus = () => {
      if (inputRef.current) {
        inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener('focus', handleFocus);
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener('focus', handleFocus);
      }
    };
  }, []);

  const totalFutureValue = ((((user?.aicoreBalance || 0) + plusStartCore) + dailyReward * 365.25 * coreAfterXyears) * 
    ((dailyCoreRate * reinvestmentPart + 1) ** 365.25) ** coreAfterXyears);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Удаляем все нецифровые символы
    const value = e.target.value.replace(/[^\d]/g, '');
    
    // Форматируем число с пробелами
    const formattedValue = value ? Number(value).toLocaleString('en-US').replace(/,/g, ' ') : '';
    
    // Обновляем значение в input
    e.target.value = formattedValue.toString();
    
    // Обновляем состояние с числовым значением
    setTargetAmount(value ? parseInt(value) : 0);
  };

  const [showLevelUpPopup, setShowLevelUpPopup] = useState(false);
  // const [newLevel, setNewLevel] = useState(0);

  useEffect(() => {
    if (user) {
      const levelDifference = aicoreLevel - (user?.level || 0);
      
      // Check if level has increased
      if (levelDifference > 0) {
        setShowLevelUpPopup(true);
        if (!showLevelUpPopup) {
          handleUpdateUser({
            level: 1
          });
        }
      }
    }
  }, [aicoreLevel, user, handleUpdateUser]);

  return (
    <main className="bg-[#1c2033] text-white min-h-screen p-2">
      {/* Header section with image and progress */}
      <div className="h-48 rounded-lg overflow-hidden relative mb-1">
        <Image src={currentImage} alt="AI Assistant" className="w-full h-full object-cover" />
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center">
          <div className="relative w-80 opacity-80 h-4 mr-10 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-yellow-500"
              style={{ width: `${progressPercentage}%` }}
            />
            <div className="absolute inset-0 opacity-100 flex items-center justify-center text-xs font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
              {Math.floor((user?.aicoreBalance || 0) * 100) / 100}$ / {balanceRequiredForNextLevel[aicoreLevel]}$
            </div>
          </div>
          {/* Move the aicoreLevel display to the bottom right corner */}
          <div className="absolute bottom-0 right-0 text-yellow-500 border-2 border-yellow-500 rounded-full w-8 h-8 flex items-center justify-center font-bold">
            {aicoreLevel}
          </div>
        </div>
      </div>

      {/* Stats section */}
      <div className="rounded-lg bg-gray-800 hover:bg-gray-700 transition-all p-2 mb-1">

        {/* Reinvestment slider */}
        <div className="mb-1">
          <label className="flex items-center justify-between mb-0">
            APY 26% 
            <span>Reinvest</span>
            <input
              type="number"
              value={Math.round(reinvestmentPart * 100)}
              onChange={handleReinvestmentChange}
              className="w-16 h-6 text-black rounded text-center"
              min="0"
              max="100"
            />
          </label>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${reinvestmentPart * 100}%` }}
            />
          </div>
        </div>
        <div className="text-lg font-semibold mb-1">
          
          <div className="flex justify-between text-sm mt-0">
            <span>Wallet: {((user?.aicoreBalance || 0) * dailyCoreRate * (1 - reinvestmentPart)).toFixed(2)}$/d</span>
            <span>Core: {((user?.aicoreBalance || 0) * dailyCoreRate * (reinvestmentPart)).toFixed(2)}$/d</span>
          </div>
        </div>

        {/* Input fields in grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block">
              <span className="text-sm">Start Core $</span>
              <input
                type="number"
                value={plusStartCore}
                onChange={(e) => setPlusStartCore(Math.min(99999, Math.max(0, parseInt(e.target.value))))}
                className="w-full mt-1 px-3 py-0 text-black rounded"
              />
            </label>
          </div>
          <div className="space-y-2">
            <label className="block">
              <span className="text-sm">Daily Rewards $/d</span>
              <input
                type="text"
                value={dailyRewardInput}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (/^\d{0,3}(\.\d{0,1})?$/.test(value) && value.length <= 4)) {
                    setDailyRewardInput(value);
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue) && numValue <= 999.9) {
                      setDailyReward(numValue);
                    }
                  }
                }}
                onBlur={() => {
                  if (dailyRewardInput === '' || isNaN(parseFloat(dailyRewardInput))) {
                    setDailyRewardInput('0');
                    setDailyReward(0);
                  } else {
                    const numValue = Math.min(999.9, parseFloat(dailyRewardInput));
                    setDailyRewardInput(numValue.toFixed(1));
                    setDailyReward(numValue);
                  }
                }}
                className="w-full mt-1 px-3 py-0 text-black rounded"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Calculator section */}
      <div className="rounded-lg bg-gray-800 hover:bg-gray-700 transition-all p-2 mb-1">
        <div className="mb-1 flex items-center">
          <span>Core in years</span>
          <input
            type="number"
            value={coreAfterXyears}
            onChange={(e) => setCoreAfterXyears(Math.min(30, Math.max(0, parseInt(e.target.value) )))}
            className="w-10 h-6 p-1 border border-black text-black rounded mx-2"
            min="1"
            max="30"
          />
          <span className="ml-0 text-yellow-500 font-bold">
           {
            
            totalFutureValue
            .toFixed(0)
            .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
          }$
          </span>
        </div>
        <div className="flex items-center">
          <span className="ml-0 text-white">Daily </span>
          <span className="ml-2 text-yellow-500 font-bold">{(totalFutureValue * dailyCoreRate).toFixed(2)} $/d.</span>
        </div>

        {<div className="mb-0 flex items-center">
          <span className="mr-2">Goal</span>
          <input
            type="text"
            value={targetAmount}
            onChange={handleInputChange}
            className="w-32 h-6 p-1 border border-black text-black rounded"
          />
          <span className="ml-1">$</span>
          <button onClick={calculateDaysToTarget} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-0 px-4 ml-4 rounded">Calculate</button>
        </div> }

        <div className="mt-2 text-yellow-500">
          Time to Goal: {
            (() => {
              const years = Math.floor(daysToTarget / 365.25);
              const remainingDays = Math.floor(daysToTarget % 365.25);

              return `${years} years ${remainingDays} days`;
            })()
          }
        </div>
     
      </div>

      {/* Action buttons */}
      <button 
        onClick={() => handleButtonClick('upCore')}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 
                   text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-200"
      >
        Up Core
      </button>

      {/* Up Core modal */}
      {selectedAction === 'upCore' && (
        <div className="mt-1 bg-[#252a41] p-4 rounded-lg border border-gray-600">
          <div className="mb-1 text-center">Wallet: {Math.floor((user?.walletBalance || 0) * 100) / 100} $</div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="text-black w-full p-2 mb-2 border border-gray-300 rounded"
            min="0"
          />
          <button
            onClick={handleActionSubmit}
            disabled={isTransactionInProgress} // Disable button while transaction is in progress
            className="w-full bg-purple-500 hover:bg-purple-700 text-sm text-white font-bold py-2 px-4 rounded"
          >
            Confirm Up Core
          </button>
        </div>
      )}

      {/* Reinvest setup */}
      <div className="rounded-lg bg-gray-800 hover:bg-gray-700 transition-all p-2 mb-1">
        <div className="flex justify-between">
          <div >
            Reinvest
            
            <input 
              type="number" 
              value={reinvestmentSetupInput} 
              ref={inputRef} // Attach ref to the input
              className="w-10 h-6 p-1 border border-black text-black rounded ml-2"
              onChange={(e) => {
                const value = Math.min(100, Math.max(0, parseInt(e.target.value))); // Ensure value is between 0 and 100
                setReinvestmentSetupInput(value);
              }} 
            /> %
          </div>
          {(reinvestmentSetupInput >= minValue) && 
              <button 
              onClick={handleSaveReinvestSetup}
              // disabled={reinvestmentSetupInput >= minValue}
              className={`py-0 px-4 rounded font-bold ${isSaved ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-700'} text-white`}
            >
              {isSaved ? '✔' : 'Save'}
            </button>
            }

        </div>
        <div className="flex justify-between text-sm mt-2">
              <span> current: {user?.reinvestSetup}%</span>
          <span>min(-5%*lvl): {Math.max(0, minValue)}%</span >
        </div>
      </div>

      <DailyRewardPopup
        isOpen={showRewardPopup}
        onClose={() => setShowRewardPopup(false)}
        daysSkipped={rewardData.daysSkipped}
        aicoreIncrease={rewardData.aicoreIncrease}
        walletIncrease={rewardData.walletIncrease}
      />

      <LevelUpPopup
        isOpen={showLevelUpPopup}
        onClose={() => setShowLevelUpPopup(false)}
        newLevel={(user?.level || 0)}
      />
    </main>
  );
}
