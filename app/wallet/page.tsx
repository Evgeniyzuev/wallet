'use client'
// TODO: add walletBalance

import { useEffect, useState } from 'react'
import { useUser } from '../UserContext';

export default function Wallet() {
  const { user, handleUpdateUser } = useUser();
  // const [walletBalance, setWalletBalance] = useState<number>(0);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');

  // useEffect(() => {
  //   if (user?.walletBalance !== undefined) {
  //     setWalletBalance(user.walletBalance);
  //   }
  // }, [user]);

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
      case 'receive':
        // setUser((prevUser: User | null) => {
        //   if (prevUser) {
        //     return {
        //       ...prevUser,
        //       walletBalance: prevUser.walletBalance + amountNumber
        //     };
        //   }
        //   return prevUser;
        // });
        result = await handleUpdateUser({
          walletBalance: amountNumber
        });
        break;
      case 'send':
        if (amountNumber > (user?.walletBalance || 0)) {
          console.error('Insufficient balance');
          return;
        }
        // amountNumber = -amountNumber;
        // setUser((prevUser: User | null) => {
        //   if (prevUser) {
        //     return {
        //       ...prevUser,
        //       walletBalance: prevUser.walletBalance + amountNumber
        //     };
        //   }
        //   return prevUser;
        // });
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
        // setUser((prevUser: User | null) => {
        //   if (prevUser) {
        //     return {
        //       ...prevUser,
        //       // walletBalance: prevUser.walletBalance - amountNumber,
        //       aicoreBalance: prevUser.aicoreBalance + amountNumber
        //     };
        //   }
        //   return prevUser;
        // });
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

    setSelectedAction(null);
    setAmount('');
  };

  return (
    <main className="bg-dark-blue text-white h-screen flex flex-col flex flex-col items-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Wallet</h1>
        <p className="text-2xl mb-8">Wallet Balance: {Math.floor((user?.walletBalance || 0) * 100) / 100} USD</p>
        <div className="flex justify-center mb-4">
          <div className="flex items-center space-x-4 w-72">
            <button 
              onClick={() => handleButtonClick('receive')}
              className="w-32 bg-blue-500 hover:bg-blue-700 text-sm text-white font-bold py-2 px-4 rounded mr-4"
            >
              Receive
            </button>
            <button 
              onClick={() => handleButtonClick('send')}
              className="w-32 bg-red-500 hover:bg-red-700 text-sm text-white font-bold py-2 px-4 rounded"
            >
              Send
            </button>
          </div>
        </div>
        <button 
          onClick={() => handleButtonClick('upCore')}
          className="w-72 bg-green-500 hover:bg-green-700 text-sm text-white font-bold py-2 px-4 rounded"
        >
          Up Core
        </button>
        
        {selectedAction && (
          <div className="mt-8 p-4 border border-gray-300 rounded">
            <h2 className="text-xl font-bold mb-4">
              {selectedAction === 'receive' ? 'Receive' :
               selectedAction === 'send' ? 'Send' : 'Up Core'}
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
      {/* <Navigation /> */}
    </main>
  );
}
