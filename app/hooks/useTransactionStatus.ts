import { useState, useCallback, useEffect } from 'react';
import { useUserData } from './useUserData';
import { toNano } from '@ton/core';



// export function useTransactionAmount() {
//   // ... hook logic
// }

// // Then in your component:
// const amount = useTransactionAmount();

export const useTransactionStatus = () => {
  const [transactionStatus, setTransactionStatus] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const { handleIncreaseWalletBalance } = useUserData();
  const { user } = useUserData();
  const [transactionAmount, setTransactionAmount] = useState<number>(0);

  useEffect(() => {
    if (user) {
      setWalletBalance(user.walletBalance || 0);
    }
  }, [user]);

  async function checkTransactionStatus(hash: string) {
    try {
      const response = await fetch(`https://toncenter.com/api/v3/transactions?msg_hash=${hash}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.NEXT_PUBLIC_MAINNET_TONCENTER_API_KEY || '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transaction status');
      }

      const data = await response.json();
      if (data && data.transactions && data.transactions.length > 0) {
        const transaction = data.transactions[0];
        if (transaction.description && transaction.description.compute_ph) {
            // transaction.description.action.success
          if (transaction.description.compute_ph.success) {
            console.log('Transaction confirmed:', hash);
            setTransactionStatus('confirmed');
            // TODO: добавить баланс кошелька
            // const incomingAmount = transaction.in_msg.value; // in nano
            try {
              setTransactionAmount(transaction.in_msg.value);
            } catch (error) {
              console.error('Error setting transaction amount:', error);
            }

            // setWalletBalance(walletBalance + Number(toNano(incomingAmount)));

          } else {
            console.log('Transaction failed:', hash);
            setTransactionStatus('failed');
          }
        } else {
          console.log('Transaction status unknown:', hash);
          setTransactionStatus('unknown');
        }
      } else {
        console.log('Transaction not found:', hash);
        setTransactionStatus('not found');
      }
    } catch (error) {
      console.error('Error checking transaction status:', error);
      setTransactionStatus('error');
    }
  }

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (transactionHash && transactionStatus === 'checking') {
      intervalId = setInterval(() => {
        checkTransactionStatus(transactionHash);
      }, 5000); // Проверка каждые 5 секунд
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [transactionHash, transactionStatus]);

  const startChecking = useCallback((hash: string) => {
    setTransactionHash(hash);
    setTransactionStatus('checking');
  }, []);

  return { transactionStatus, startChecking, transactionAmount };
};
