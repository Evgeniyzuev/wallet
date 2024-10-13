'use client'
// TODO: add walletBalance

import Navigation from '../components/Navigation'  
import { useUserData } from '../hooks/useUserData'
import { useEffect, useState } from 'react'

export default function Wallet() {
  const { user, handleIncreaseWalletBalance } = useUserData();
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const { handleIncreaseAicoreBalance } = useUserData();

  useEffect(() => {
    if (user?.walletBalance !== undefined) {
      setWalletBalance(user.walletBalance);
    }
  }, [user]);

  const handleButtonClick = (action: string) => {
    setSelectedAction(action);
    setAmount('');
  };

  const handleActionSubmit = async () => {
    if (!amount || isNaN(Number(amount))) {
      console.error('Invalid amount');
      return;
    }

    let amountNumber = Number(amount);
    let result;

    switch (selectedAction) {
      case 'topUpWallet':
        result = await handleIncreaseWalletBalance(amountNumber);
        break;
      case 'withdraw':
        if (amountNumber > walletBalance) {
          console.error('Insufficient balance');
          return;
        }
        amountNumber = -amountNumber;
        result = await handleIncreaseWalletBalance(amountNumber);
        break;
      case 'topUpCore':
        // Handle topUpCore action handleIncreaseAicoreBalance
        if (amountNumber > walletBalance) {
          console.error('Insufficient balance');
          return;
        }
        result = await handleIncreaseAicoreBalance(amountNumber);
        amountNumber = -amountNumber;
        result = await handleIncreaseWalletBalance(amountNumber);
        console.log('Top Up Core action not implemented yet');
        break;
      default:
        console.error('Unknown action');
        return;
    }

    if (result?.success) {
      console.log(result.message);
      // Update the local wallet balance immediately
      setWalletBalance(walletBalance + amountNumber);
    } else {
      console.error(result?.message || 'Action failed');
    }

    setSelectedAction(null);
    setAmount('');
  };

  return (
    <main className="bg-black text-white h-screen flex flex-col flex flex-col items-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Wallet</h1>
        <p className="text-2xl mb-8">Wallet Balance: {walletBalance.toFixed(2)} USD</p>
        <div className="flex justify-center mb-4">
          <div className="flex items-center space-x-4 w-72">
            <button 
              onClick={() => handleButtonClick('topUpWallet')}
              className="w-32 bg-blue-500 hover:bg-blue-700 text-sm text-white font-bold py-2 px-4 rounded mr-4"
            >
              Top Up Wallet
            </button>
            <button 
              onClick={() => handleButtonClick('withdraw')}
              className="w-32 bg-red-500 hover:bg-red-700 text-sm text-white font-bold py-2 px-4 rounded"
            >
              Withdraw
            </button>
          </div>
        </div>
        <button 
          onClick={() => handleButtonClick('topUpCore')}
          className="w-72 bg-green-500 hover:bg-green-700 text-sm text-white font-bold py-2 px-4 rounded"
        >
          Top Up Core
        </button>
        
        {selectedAction && (
          <div className="mt-8 p-4 border border-gray-300 rounded">
            <h2 className="text-xl font-bold mb-4">
              {selectedAction === 'topUpWallet' ? 'Top Up Wallet' :
               selectedAction === 'withdraw' ? 'Withdraw' : 'Top Up Core'}
            </h2>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="text-black w-full p-2 mb-2 border border-gray-300 rounded"
            />
            <button
              onClick={handleActionSubmit}
              className="w-full bg-purple-500 hover:bg-purple-700 text-sm text-white font-bold py-2 px-4 rounded"
            >
              Confirm
            </button>
          </div>
        )}
      </div>
      <Navigation />
    </main>
  );
}
