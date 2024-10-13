'use client'

import { useState, useEffect, useCallback } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address, beginCell, toNano, } from "@ton/core";
import Navigation from '../components/Navigation'
import { useUserData } from '../hooks/useUserData'
import { Cell } from '@ton/core';
import TonWeb from "tonweb";
import { useTransactionStatus } from '../hooks/useTransactionStatus';

const tonweb = new TonWeb(new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC', {apiKey: process.env.NEXT_PUBLIC_MAINNET_TONCENTER_API_KEY}));


 

// const forwardPayload = beginCell()
//     .storeUint(0, 32) // 0 opcode means we have a comment
//     .storeStringTail('Hello, TON!')
//     .endCell();

// const body = beginCell()
//     // .storeUint(0xf8a7ea5, 32) // opcode for jetton transfer
//     // .storeUint(0, 64) // query id
//     // .storeCoins(toNano("0.5")) // Jetton amount for transfer (decimals = 6 - USDT, 9 - default). Function toNano use decimals = 9 (remember it)
//     // .storeAddress(destinationAddress) // TON wallet destination address
//     // .storeAddress(destinationAddress) // response excess destination
//     // .storeBit(0) // no custom payload
//     // .storeCoins(toNano("0.2")) // forward amount (if >0, will send notification message)
//     // .storeBit(1) // we store forwardPayload as a reference
//     // .storeRef(forwardPayload)
//     // .endCell();
//     .storeUint(0xf8a7ea5, 32) // op transfer
//     .storeUint(0, 64) // queryId
//     .storeCoins(toNano(2)) // deposit_amount
//     .storeAddress(
//       Address.parse(destinationAddress.toString()),
//     ) // receiver address
//     .storeAddress(Address.parse(destinationAddress.toString())) //response_adress - address nhận phí GD thừa
//     .storeMaybeRef(null) // custom_payload
//     .storeCoins(toNano("0.05")) // forward_ton_amount
//     .storeMaybeRef(beginCell().storeStringTail("something").endCell()) // forward_payload_amount if receiver is a smart contract
//     .endCell();





export default function WalletPage() {
  const [tonConnectUI] = useTonConnectUI();
  const [tonWalletAddress, setTonWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tonAmount, setTonAmount] = useState('1');
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const { transactionStatus, startChecking } = useTransactionStatus();
  const { transactionAmount } = useTransactionStatus();
  // const [amountToWalletBalance, setAmountToWalletBalance] = useState<number>(0);
  const { user } = useUserData();
  const [destinationAddress, setDestinationAddress] = useState('');

  useEffect(() => {
    setDestinationAddress(process.env.NEXT_PUBLIC_DESTINATION_ADDRESS || '');
  }, []);

  useEffect(() => {
    if (user) {
      setWalletBalance(user.walletBalance || 0);
    }
  }, [user]);

  // useEffect(() => {
  //   if (transactionStatus === 'confirmed' && amountToWalletBalance > 0) {
  //     handleIncreaseWalletBalance(amountToWalletBalance / 1e9);
  //     setAmountToWalletBalance(0); // Reset the amount
  //   }
  // }, [transactionStatus, amountToWalletBalance, walletBalance, handleIncreaseWalletBalance]);





  const handleWalletConnection = useCallback((address: string) => {
    setTonWalletAddress(address);
    console.log("Wallet connected successfully!");
    setIsLoading(false);
  }, []);

  const handleWalletDisconnection = useCallback(() => {
    setTonWalletAddress(null);
    console.log("Wallet disconnected successfully!");
    setIsLoading(false);
  }, []);


  // const myTransaction = {
  //   // validUntil: Math.floor(Date.now() / 1000) + 360,
  //   // messages: [
  //   // {
  //   // address: destinationAddress, // sender jetton wallet
  //   // amount: toNano("2.2").toString(), // for commission fees, excess will be returned
  //   // payload: body.toBoc().toString("base64") // payload with jetton transfer and comment body
  //   validUntil: Math.floor(Date.now() / 1000) + 360,
  //   messages: [
  //     {
  //       address: destinationAddress.toString(), // Your USDT jetton wallet address
  //       amount: toNano(0.1).toString(), // feee
  //       payload: body.toBoc().toString("base64"), // payload with jetton transfer and comment body
  //   }
  //   ]
  //   }

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (tonConnectUI.account?.address) {
        handleWalletConnection(tonConnectUI.account?.address);
      } else {
        handleWalletDisconnection();
      }
    };

    checkWalletConnection();

    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      if (wallet) {
        handleWalletConnection(wallet.account.address);
      } else {
        handleWalletDisconnection();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [tonConnectUI, handleWalletConnection, handleWalletDisconnection]);

  const handleWalletAction = async () => {
    if (tonConnectUI.connected) {
      setIsLoading(true);
      await tonConnectUI.disconnect();
    } else {
      await tonConnectUI.openModal();
    }
  };

  const formatAddress = (address: string) => {
    const tempAddress = Address.parse(address).toString();
    return `${tempAddress.slice(0, 4)}...${tempAddress.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded">
          Loading...
        </div>
      </main>
    );
  }

  const sendToncoin = async () => {
    if (!tonConnectUI.connected || !tonWalletAddress) {
      console.log("Wallet not connected");
      return;
    }

    try {
      const amountInNanotons = toNano(tonAmount).toString();
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60, // Valid for 60 seconds
        messages: [
          {
            address: destinationAddress,
            amount: amountInNanotons,
          },
        ],
      };

      // setAmountToWalletBalance(Number(amountInNanotons));

      const result = await tonConnectUI.sendTransaction(transaction);
      console.log("Transaction sent:", result);
      
      // Get the transaction hash
      const cell = Cell.fromBase64(result.boc);
      const buffer = cell.hash();
      const hashHex = buffer.toString('hex');
      
      return hashHex;
    } catch (error) {
      console.error("Error sending transaction:", error);
      throw error;
    }
  };

  

  const handleSendToncoin = async () => {
    try {
      const hash = await sendToncoin();
      setTransactionHash(hash || '');

      // Добавляем транзакцию в очередь и проверяем ее через API Toncenter
      // addTransaction(hash, tonAmount, new Date().toLocaleString(), tonWalletAddress, destinationUsdtAddress.toString());

      // Проверка статуса транзакции каждые 5 секунд
      startChecking(hash!);
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">TON Connect Demo</h1>
                  {/* вывод баланса */}
                  <p>Wallet Balance: {walletBalance.toFixed(2)} TON</p>
      {tonWalletAddress ? (
        <div className="flex flex-col items-center">
          <p className="mb-4">Connected: {formatAddress(tonWalletAddress)}</p>

          <button
            onClick={handleWalletAction}
            className="bg-red-500 hover:bg-red-700 w-60 mb-4 text-white font-bold py-2 px-4 rounded"
          >
            Disconnect Wallet
          </button>
          <div className="flex flex-col items-center mb-4">
            <input
              type="number"
              value={tonAmount}
              onChange={(e) => setTonAmount(e.target.value)}
              className="w-60 mb-2 p-2 border border-gray-300 rounded"
              placeholder="Enter TON amount"
              min="0"
              step="0.1"
            />
            <button
              onClick={handleSendToncoin}
              className="bg-green-500 hover:bg-green-700 w-60 text-white font-bold py-2 px-4 rounded"
            >
              Send {tonAmount} TON
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleWalletAction}
          className="bg-blue-500 hover:bg-blue-700 mb-4 text-white font-bold py-2 px-4 rounded"
        >
          Connect TON Wallet
        </button>
      )}
      {transactionHash && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <p className="text-sm">Transaction Message Hash:</p>
          <p className="font-mono text-xs break-all">{transactionHash}</p>
          {/* время транзакции */}
          <p className="text-sm">Transaction Time: {new Date().toLocaleString()}</p>
          {/* сумма транзакции */}
          <p className="text-sm">Transaction Amount: {tonAmount} TON</p>
          {/* адрес отправителя */}
          <p className="text-sm">Sender Address: {formatAddress(tonWalletAddress || '')}</p>
          {/* адрес получателя */}
          <p className="text-sm">Receiver Address: {formatAddress(destinationAddress.toString())}</p>
        </div>
      )}
      <Navigation />
      {transactionStatus && <h2>Transaction Status: {transactionStatus}</h2>}
      {transactionAmount && <h2>Transaction Amount: {transactionAmount}</h2>}
    </main>
  );
}