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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [workchain, setWorkchain] = useState<number | null>(null);
  const [balance, setBalance] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [transactionStatus, setTransactionStatus] = useState<string>('');
  const [amount, setAmount] = useState<string>('0.05');
  const [tonConnectAddress, setTonConnectAddress] = useState<string | null>(null);
  const [tonConnectUI] = useTonConnectUI();

  const handleWalletConnection = useCallback((address: string) => {
    setTonConnectAddress(address); 

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (tonConnectUI.account?.address) {
        // handleWalletConnection(wallet.account.address);
        handleWalletConnection(tonConnectUI.account?.address);
      } 
    };

    checkWalletConnection();

        // Сохраняет адрес в локальном состоянии       // Сохраняет адрес в глобальном контексте

      }, []);

    // const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
    //   if (wallet) {
    //     handleWalletConnection(wallet.account.address);
    //   } else {
    //     handleWalletDisconnection();
    //   }
    // });

  }, []);

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
        setWorkchain(wallet.address.workChain);
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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value;
    const numAmount = parseFloat(newAmount);
    const numBalance = parseFloat(balance);

    if (!isNaN(numAmount) && numAmount > numBalance) {
      setError('Недостаточно средств на балансе');
      setAmount(balance); // Устанавливаем максимально доступную сумму
    } else {
      setError('');
      setAmount(newAmount);
    }
  };

  const sendTon = async () => {
    try {
      // Проверка корректности введенной суммы
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0 ) {
        setError('Пожалуйста, введите корректную сумму');
        return;
      }

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

      const balance = await client.getBalance(wallet.address);
      setBalance(fromNano(balance));
      
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

      // Ожидание подтверждения транзакции
      let currentSeqno = seqno;
      while (currentSeqno == seqno) {
        setTransactionStatus('Ожидание подтверждения транзакции...');
        await sleep(1500);
        currentSeqno = await walletContract.getSeqno();
      }
      setTransactionStatus('Транзакция успешно подтверждена!');
      
    } catch (error) {
      setTransactionStatus('Ошибка при выполнении транзакции');
      setError(error instanceof Error ? error.message : 'Ошибка при отправке TON');
      console.error('Error sending TON:', error);
    }
  };

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Информация о кошельке</h1>
      {error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : (
        <div className="space-y-2">
          <div className="font-mono break-all">
            <span className="font-bold">Адрес кошелька:</span>{' '}
            {walletAddress || 'Загрузка...'}
          </div>
          <div className="font-mono break-all">
            <span className="font-bold">Адрес Tonconnect:</span>{' '}
            {tonConnectAddress || 'Загрузка...'}
          </div>
          <p>
            <span className="font-bold">Воркчейн:</span>{' '}
            {workchain !== null ? workchain : 'Загрузка...'}
          </p>
          <p>
            <span className="font-bold">Баланс:</span>{' '}
            {balance ? `${balance} TON` : 'Загрузка...'}
          </p>
        </div>
      )}
      {/* <p>Send to address: {tonconnectAddress}</p> */}

      <div className="mt-4 space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            step="0.01"
            min="0"
            max={balance}
            className="border rounded p-2 w-32"
            placeholder="Сумма TON"
          />
          <span className="text-gray-600">TON</span>
          {error && <span className="text-red-500 text-sm">{error}</span>}
        </div>

        <button
          onClick={sendTon}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Отправить {amount} TON
        </button>
        
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
