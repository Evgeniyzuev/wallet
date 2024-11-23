'use client'

import { useEffect, useState } from 'react'
import { useUser } from '../UserContext';
// import ReceivePopup from '../components/ReceivePopup';
import TonConnect from './tonconnect';
import Send from './send';

export default function Wallet() {
  const { user, handleUpdateUser } = useUser();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  // const [isReceivePopupOpen, setIsReceivePopupOpen] = useState(false);
  const [isTransactionInProgress, setIsTransactionInProgress] = useState(false);
  const [tonPrice, setTonPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchTonPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd');
        const data = await response.json();
        setTonPrice(data['the-open-network'].usd);
      } catch (error) {
        console.error('Error fetching TON price:', error);
      }
    };

    fetchTonPrice();
    const interval = setInterval(fetchTonPrice, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Calculate TON amount from USD balance
  const getTonAmount = () => {
    if (!tonPrice || !user?.walletBalance) return 0;
    return user.walletBalance / tonPrice;
  };

  const handleButtonClick = (action: string) => {
    setSelectedAction(action);
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

    let amountNumber = Number(amount);
    let result;

    try {
      setIsTransactionInProgress(true); // Set the transaction in progress state

      switch (selectedAction) {
        case 'receive':
          result = await handleUpdateUser({
            walletBalance: amountNumber
          });
          break;
        case 'send':
          if (amountNumber > (user?.walletBalance || 0)) {
            console.error('Insufficient balance');
            return;
          }

          result = await handleUpdateUser({
            walletBalance: -amountNumber
          });
          break;
        case 'upCore':
          // Handle topUpCore action handleIncreaseAicoreBalance
          if (amountNumber > (user?.walletBalance || 0)) {
            console.error('Insufficient balance');
            return;
          }
          result = await handleUpdateUser({
            walletBalance: -amountNumber,
            aicoreBalance: amountNumber
          });

          console.log('Top Up Core action not implemented yet');
          break;
        default:
          console.error('Unknown action');
          return;
      }

      if (result?.success) {
        console.log(result.message);
        // Update the local wallet balance immediately
        // setWalletBalance((user?.walletBalance || 0) + amountNumber);
      } else {
        console.error(result?.message || 'Action failed');
      }
    } catch (error) {
      console.error('Error during transaction:', error);
    } finally {
      setIsTransactionInProgress(false); // Reset the transaction state
      setSelectedAction(null);
      setAmount('');
    }
  };

  return (
    <main className="bg-dark-blue text-white flex flex-col items-center min-h-screen">
      <div className="text-center w-full max-w-lg px-4">
        <div className="flex justify-between items-center mb-4 mt-4 ml-4">
          <p className="text-4xl text-bold">{Math.floor((user?.walletBalance || 0) * 100) / 100}$</p>
          <p className="text-2xl text-gray-400">
            {tonPrice ? `${getTonAmount().toFixed(2)} TON` : 'Loading...'}
          </p>
        </div>
        
        
        <div className="grid grid-cols-3 gap-1 mb-8">
          <button 
            onClick={() => handleButtonClick('send')}
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all"
          >
            <span className="text-2xl mb-2">↑</span>
            <span className="text-sm">Send</span>
          </button>

          <button 
            onClick={() => handleButtonClick('receive')}
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all"
          >
            <span className="text-2xl mb-2">↓</span>
            <span className="text-sm">Receive</span>
          </button>

          <button 
            onClick={() => handleButtonClick('upCore')}
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all"
          >
            <span className="text-2xl mb-2">↗</span>
            <span className="text-sm">Up Core</span>
          </button>

          <button 
            onClick={() => handleButtonClick('scan')}
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all"
          >
            <span className="text-2xl mb-2">⟲</span>
            <span className="text-sm">Scan</span>
          </button>

          <button 
            onClick={() => handleButtonClick('exchange')}
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all"
          >
            <span className="text-2xl mb-2">↑↓</span>
            <span className="text-sm">Exchange</span>
          </button>

          <button 
            onClick={() => handleButtonClick('buy')}
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all"
          >
            <span className="text-2xl mb-2">$</span>
            <span className="text-sm">Buy TON</span>
          </button>


        </div>

        {( selectedAction === 'upCore' || selectedAction === 'receive') && (
          <div className="mt-8 p-4 border border-gray-700 rounded-lg bg-gray-800">
            <h2 className="text-xl font-bold mb-4">
              {selectedAction}
            </h2>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
            <button
              onClick={handleActionSubmit}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Confirm
            </button>
          </div>
        )}
        
        {selectedAction === 'receive' && <TonConnect />}
        {selectedAction === 'send' && <Send />}

        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-xl">👆</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm">Включите биометрию</span>
                <span className="text-xs text-gray-400">для подтверждения транзакций</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>
        </div>
      </div>
    </main>
  );
}
