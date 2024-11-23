'use client';

import { mnemonicToWalletKey } from "@ton/crypto";
import { WalletContractV4 } from "@ton/ton";
import { useState, useEffect, useCallback } from 'react';
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient } from "@ton/ton";
import { fromNano } from "@ton/core";
import { internal } from "@ton/ton";
// import { useWallet } from './WalletContext';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address } from "@ton/core";
import { useUser } from '../UserContext';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const formatAddress = (address: string) => {
  const tempAddress = Address.parse(address).toString();
  return `${tempAddress.slice(0, 4)}...${tempAddress.slice(-4)}`;
};

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string>('');
//   const [workchain, setWorkchain] = useState<number | null>(null);
  const [balance, setBalance] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [transactionStatus, setTransactionStatus] = useState<string>('');
  const [amount, setAmount] = useState<string>('0.05');
  const [tonConnectAddress, setTonConnectAddress] = useState<string | null>(null);
  const [tonConnectUI] = useTonConnectUI();
  const { user, handleUpdateUser } = useUser();
  const [tonPrice, setTonPrice] = useState<number | null>(null);
//   const [maxAmount, setMaxAmount] = useState<number>(0);

  const handleWalletConnection = useCallback((address: string) => {
    setTonConnectAddress(address);
    console.log("Wallet connected successfully!");
  }, []);

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (tonConnectUI.account?.address) {
        handleWalletConnection(tonConnectUI.account.address);
      }
    };

    checkWalletConnection();

    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      if (wallet) {
        handleWalletConnection(wallet.account.address);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [tonConnectUI, handleWalletConnection]);

  useEffect(() => {
    async function getWalletInfo() {
      try {
        const mnemonic = process.env.NEXT_PUBLIC_DEPLOYER_WALLET_MNEMONIC;
        if (!mnemonic) {
          throw new Error("Mnemonic не установлен");
        }
        
        const key = await mnemonicToWalletKey(mnemonic.split(" "));
        const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
        
        setWalletAddress(wallet.address.toString({ testOnly: true }));
        // setWorkchain(wallet.address.workChain);
        setError('');
         // initialize ton rpc client on testnet
        const endpoint = await getHttpEndpoint({ network: "mainnet" });
        const client = new TonClient({ endpoint });

        // query balance from chain
        const balance = await client.getBalance(wallet.address);
        setBalance(fromNano(balance));

        // query seqno from chain
        const walletContract = client.open(wallet);
        const seqno = await walletContract.getSeqno();
        console.log("seqno:", seqno);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Произошла ошибка');
        console.error('Error getting wallet info:', error);
      }
    }

    getWalletInfo();
  }, []);

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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value;
    const numAmount = parseFloat(newAmount);
    const maxBalance = parseFloat(balance);
    
    if (!isNaN(numAmount) && numAmount > maxBalance) {
      setError('Недостаточно средств на балансе');
      setAmount(maxBalance.toString()); // Set to maximum available amount
    } else {
      setError('');
      setAmount(newAmount);
    }
  };

  const sendTon = async () => {
    try {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        setError('Пожалуйста, введите корректную сумму');
        return;
      }



      // Calculate USD amount
      if (!tonPrice) {
        throw new Error("TON price is not available");
      }
      const usdAmount = numAmount * tonPrice;

      // Check if user has enough balance
      if (!user || usdAmount > (user.walletBalance)) {
        setError('Недостаточно средств на балансе');
        return;
      }

      // Deduct the amount from user's wallet balance before sending transaction


      setTransactionStatus('Инициализация транзакции...');
      const mnemonic = process.env.NEXT_PUBLIC_DEPLOYER_WALLET_MNEMONIC;
      if (!mnemonic) {
        throw new Error("Mnemonic не установлен");
      }
      if (!tonConnectAddress) {
        throw new Error("Tonconnect адрес не установлен");
      }


      const key = await mnemonicToWalletKey(mnemonic.split(" "));
      const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
      
      const endpoint = await getHttpEndpoint({ network: "mainnet" });
      const client = new TonClient({ endpoint });

      const previousBalance = user.walletBalance || 0;
      await handleUpdateUser({
        walletBalance: -usdAmount
      });

      const currentBalance = await client.getBalance(wallet.address);
      setBalance(fromNano(currentBalance));
      
      const walletContract = client.open(wallet);
      const seqno = await walletContract.getSeqno();
      
      setTransactionStatus('Отправка транзакции...');
      await walletContract.sendTransfer({
        secretKey: key.secretKey,
        seqno: seqno,
        messages: [
          internal({
            to: tonConnectAddress,
            value: amount,
            body: "Hello",
            bounce: false,
          })
        ]
      });

      // Wait for transaction confirmation
      let currentSeqno = seqno;
      let attempts = 0;
      const maxAttempts = 10;

      while (currentSeqno == seqno && attempts < maxAttempts) {
        setTransactionStatus('Ожидание подтверждения транзакции...');
        await sleep(1500);
        currentSeqno = await walletContract.getSeqno();
        attempts++;
      }

      if (attempts >= maxAttempts) {
        // Transaction failed or timeout - restore the balance
        await handleUpdateUser({
          walletBalance: previousBalance
        });
        throw new Error('Транзакция не подтверждена вовремя');
      }

      setTransactionStatus('Транзакция успешно подтверждена!');
      
    } catch (error) {
      setTransactionStatus('Ошибка при выполнении транзакции');
      // Restore the balance in case of error
      if (user) {
        await handleUpdateUser({
          walletBalance: user.walletBalance || 0
        });
      }
      setError(error instanceof Error ? error.message : 'Ошибка при отправке TON');
      console.error('Error sending TON:', error);
    }
  };

  return (
    <main className="bg-dark-blue text-white flex flex-col items-center min-h-screen">
      <div className="text-center w-full max-w-lg px-4">
        <div className="mt-0 p-4 border border-gray-700 rounded-lg bg-gray-800">
          <h2 className="text-xl font-bold mb-4">
            Send TON
          </h2>
          <input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            step="0.01"
            min="0"
            max={user?.walletBalance}
            placeholder="Enter amount"
            className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
          <button
            onClick={sendTon}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Confirm
          </button>
        </div>

        <h1 className="text-lg">Макс: {user?.walletBalance},{balance},{tonPrice} TON</h1>
      {error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : (
        <div className="space-y-2">
          {/* <div className="font-mono break-all">
            <span className="font-bold">Адрес кошелька:</span>{' '}
            {walletAddress || 'Загрузка...'}
          </div> */}
          <div className="font-mono break-all">
            <span className="font-bold">Адрес Tonconnect:</span>{' '}
            {tonConnectAddress ? formatAddress(tonConnectAddress) : 'Не подключен'}
          </div>
          {/* <p>
            <span className="font-bold">Баланс:</span>{' '}
            {balance ? `${balance} TON` : 'Загрузка...'}
          </p> */}
          </div>
        )}

        {transactionStatus && (
          <div className={`p-4 rounded ${
            transactionStatus.includes('успешно') 
              ? 'bg-green-100 text-green-700' 
              : transactionStatus.includes('Ошибка')
              ? 'bg-red-100 text-red-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {transactionStatus}
          </div>
        )}
      </div>
    </main>
  );
}
