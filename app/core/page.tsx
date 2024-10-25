'use client'

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import aissistImage from '../images/aissist0.png';
import { useUser } from '../UserContext'; 


export default function Core() {
  const { user, handleUpdateUser } = useUser();
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

  // занети уровень в базу данных
  handleUpdateUser({
    level: aicoreLevel - (user?.level || 0)
  });
  


  const handleSkipDay = async () => {
    if (!user) return;
    let reinvestSetup = 0;
    if (user.reinvestSetup <= minValue) reinvestSetup = minValue;
    else if (user.reinvestSetup > 100) reinvestSetup = 100;
    else reinvestSetup = user.reinvestSetup;

    try {
      const aicoreIncrease = user.aicoreBalance * (dailyCoreRate * user.reinvestSetup);
      const walletIncrease = user.aicoreBalance * (dailyCoreRate * (1 - user.reinvestSetup));
      await handleUpdateUser({
        walletBalance: walletIncrease,  // Increase wallet balance by 10
        aicoreBalance: aicoreIncrease,   // Increase aicore balance by 5
        level: 0            // Increase level by 1
      });
    } catch (error) {
      console.error('Error updating balances:', error);
      alert('An error occurred while updating balances');
    }
  };

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
      const currentAmount = (user.aicoreBalance + dailyReward * days) * ((dailyCoreRate * reinvestmentPart + 1) ** days);


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

  return (
    <main className="bg-[#1c2033] text-white min-h-screen" style={{ height: '150vh' }}>
      <div className="h-1/4 flex items-center justify-center overflow-hidden relative">
      <Image src={currentImage} alt="AI Assistant" className="w-full h-full object-cover" />
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center">
          <div className="relative w-80 h-4 bg-gray-700 bg-opacity-50 rounded-full overflow-hidden mr-2">
            <div
              className="absolute top-0 left-0 h-full bg-yellow-500 bg-opacity-50"
              style={{ width: `${progressPercentage}%` }}
            >
            </div>
            <div className="absolute inset-0 flex items-center justify-center text-xs text-white">
            {Math.floor((user?.aicoreBalance || 0) * 100) / 100}$ / {balanceRequiredForNextLevel[aicoreLevel]}$
            </div>
          </div>
          <div className="text-yellow-500 border border-yellow-500 rounded-full w-8 h-8 flex items-center justify-center">
            {aicoreLevel}
          </div>
        </div>
      </div>
      <div className="mb-1 mt-2">APY 26%. Core: {((user?.aicoreBalance || 0) * dailyCoreRate * (reinvestmentPart)).toFixed(2)}$/d.   Wallet: {((user?.aicoreBalance || 0) * dailyCoreRate * (1 - reinvestmentPart)).toFixed(2)}$/d</div>
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
                className="w-10 h-6 p-1 border border-black text-black rounded"
                min="0"
                max="100"
              />

              <div 
                className="w-40 h-4 bg-gray-200 rounded-full overflow-hidden mr-2"
              >
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${reinvestmentPart * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <span className="mr-2">+ Start Core</span>
              <input
                type="number"
                value={plusStartCore}
                onChange={(e) => setPlusStartCore(Math.min(99999, Math.max(0, parseInt(e.target.value) )))}
                className="w-14 h-6 p-1 border border-black text-black rounded ml-3"
                min="1"
                max="99999"
              />
              <span className="ml-1">$</span>
 
            </div>
            <div>
            <span className="mr-2">Task rewards</span>
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
                className="w-10 h-6 p-1 border border-black text-black rounded ml-2"
              />
              <span className="ml-1">$/d</span>
            </div>
            <div className="mb-1 flex items-center">
              <span className="mr-2">Core in years</span>
              <input
                type="number"
                value={coreAfterXyears}
                onChange={(e) => setCoreAfterXyears(Math.min(30, Math.max(0, parseInt(e.target.value) )))}
                className="w-10 h-6 p-1 border border-black text-black rounded mx-2"
                min="1"
                max="30"
              />
              <span className="ml-8 text-yellow-500 font-bold">
               {((((user?.aicoreBalance || 0)+ plusStartCore) + dailyReward * 365.25 * coreAfterXyears) * 
                ((dailyCoreRate * reinvestmentPart + 1) ** 365.25) ** coreAfterXyears)
                .toFixed(0)
                .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
              } $
            </span>
            </div>

            {<div className="mb-0 flex items-center">
              <span className="mr-2">Target</span>
              <input
                type="text"
                value={targetAmount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, '');
                  const formattedValue = value.replace(/\B(?=(\d{10})+(?!\d))/g, " ");
                  setTargetAmount(formattedValue.length > 0 ? parseInt(formattedValue) : 0);
                }}
                className="w-32 h-6 p-1 border border-black text-black rounded"
              />
              <span className="ml-1">$</span>
              <button onClick={calculateDaysToTarget} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 ml-4 rounded">Calculate</button>
            </div> }

            <div className="mb-4">
              days to target: {daysToTarget}
              Time to target: {
                (() => {
                  const years = Math.floor(daysToTarget / 365);
                  const remainingDays = Math.floor(daysToTarget % 365);

                  return `${years} years ${remainingDays} days`;
                })()
              }
            </div>
            <button onClick={handleSkipDay} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Skip 1 day</button>
            <button 
              onClick={() => handleButtonClick('upCore')}
              className="w-full bg-green-500 hover:bg-green-700 text-sm text-white font-bold py-2 px-4 rounded mt-4"
            >
              Up Core
            </button>
        {selectedAction === 'upCore' && (
          <div className="mt-8 p-2 border border-gray-300 rounded">
            {/* <h2 className="text-xl font-bold mb-4">Up Core</h2> */}
            <div className="mb-1 text-center">Wallet: {Math.floor((user?.walletBalance || 0) * 100) / 100} $</div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="text-black w-full p-2 mb-2 border border-gray-300 rounded"
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
        <div className="mt-4">
          <div>
            <div>
              current reinvest {user?.reinvestSetup}%
              <p>min Reinvest (-5%*lvl): {Math.max(0, minValue)}%</p>
            </div>
            
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
            {/* TODO: button to save to database */}
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
        </div>

    </main>
  );
}
