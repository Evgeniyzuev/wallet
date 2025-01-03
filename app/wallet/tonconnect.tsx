'use client'

import { useState, useEffect, useCallback } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address, beginCell, fromNano, toNano, } from "@ton/core";
import { Cell } from '@ton/core';
import TonWeb from "tonweb";
import { useTransactionStatus } from '../hooks/useTransactionStatus';
import { useUser } from '../UserContext';
// import { mnemonicToWalletKey } from "@ton/crypto";
// import { TonClient, WalletContractV4, internal } from "@ton/ton";
// import { getHttpEndpoint } from '@orbs-network/ton-access';
import { useTonPrice } from '../TonPriceContext';




 

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




export default function TonConnect() {
  const tonweb = new TonWeb(new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC', {apiKey: process.env.NEXT_PUBLIC_MAINNET_TONCENTER_API_KEY}));
  const [tonConnectUI] = useTonConnectUI();
  const [tonWalletAddress, setTonWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tonAmount, setTonAmount] = useState('1');
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const { transactionStatus, startChecking } = useTransactionStatus();
  // const [transactionStatus, setTransactionStatus] = useState<string>('');
  const { transactionAmount } = useTransactionStatus();
  // const [amountToWalletBalance, setAmountToWalletBalance] = useState<number>(0);
  const { user, handleUpdateUser } = useUser();
  const [destinationAddress, setDestinationAddress] = useState('');
  const [dollarAmount, setDollarAmount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  // const { tonConnectAddress, setTonConnectAddress } = useWallet();
  const { tonPrice } = useTonPrice();

  useEffect(() => {
    setDestinationAddress(process.env.NEXT_PUBLIC_DESTINATION_ADDRESS || '');
  }, []);

  useEffect(() => {
    if (user) {
      setWalletBalance(user.walletBalance || 0);
    }
  }, [user]);

  useEffect(() => {
    const updateUserBalance = async () => {
      if (transactionStatus === 'confirmed' && dollarAmount > 0) {
        const result = await handleUpdateUser({
          walletBalance: dollarAmount
        });
        setDollarAmount(0); // Reset the amount
      }
    };

    updateUserBalance();
  }, [transactionStatus, dollarAmount, handleUpdateUser]);

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

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (tonConnectUI.account?.address) {
        handleWalletConnection(tonConnectUI.account.address);
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
    try {
      if (tonConnectUI.connected) {
        setIsLoading(true);
        await tonConnectUI.disconnect();
      } else {
        setIsLoading(true);
        await tonConnectUI.openModal();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to connect wallet');
      console.error('Wallet connection error:', error);
    } finally {
      setIsLoading(false);
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

  

  // const startChecking = async (hash: string) => {
  //   setTransactionStatus('Инициализация транзакции...');
  //   let attempts = 0;
  //   const maxAttempts = 20;

  //   const checkTransaction = async () => {
  //     try {
  //       const response = await tonweb.getTransactions(destinationAddress);
  //       const tx = response.find((tx: any) => tx.hash === hash);
        
  //       if (tx) {
  //         setTransactionStatus('Транзакция успешно подтверждена!');
  //         // Calculate dollar amount and update user balance
  //           await handleUpdateUser({
  //             walletBalance:  dollarAmount
  //           });
  //         return true;
  //       }
        
  //       return false;
  //     } catch (error) {
  //       console.error('Error checking transaction:', error);
  //       return false;
  //     }
  //   };

  //   while (attempts < maxAttempts) {
  //     setTransactionStatus('Ожидание подтверждения транзакции...');
  //     const isConfirmed = await checkTransaction();
      
  //     if (isConfirmed) {
  //       break;
  //     }

  //     await new Promise(resolve => setTimeout(resolve, 3000));
  //     attempts++;
  //   }

  //   if (attempts >= maxAttempts) {
  //     setTransactionStatus('Ошибка: Транзакция не подтверждена вовремя');
  //   }
  // };

  const handleSendToncoin = async () => {
    try {
      const hash = await sendToncoin();
      setTransactionHash(hash || '');

      // Calculate dollar amount
      if (tonPrice !== null) {
        const dollarValue = parseFloat(tonAmount) * tonPrice;
        setDollarAmount(dollarValue);
      }

      startChecking(hash!);
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  };

  // const handleSendTonBack = async () => {
  //   if (!tonWalletAddress) {
  //     console.log("Wallet address not available");
  //     return;
  //   }

  //   try {
  //     // Initialize TonWeb instance
  //     const tonweb = new TonWeb(new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC', {
  //       apiKey: process.env.NEXT_PUBLIC_MAINNET_TONCENTER_API_KEY
  //     }));

  //     const mnemonic = process.env.NEXT_PUBLIC_DEPLOYER_WALLET_MNEMONIC; // your 24 secret words (replace ... with the rest of the words)
  //     if (!mnemonic) {
  //       throw new Error("Mnemonic is not defined");
  //     }
  //     const key = await mnemonicToWalletKey(mnemonic.split(" "));
  //     // const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });

  //     // Create wallet instance
  //     const wallet = tonweb.wallet.create({
  //       publicKey: key.publicKey
  //     });

  //     const amountInNanotons = toNano(tonAmount);
      
  //     // Get current seqno
  //     const seqno = await wallet.methods.seqno().call() ?? 0;

  //     // Ensure secretKey is defined
  //     const secretKey = key.secretKey;
  //     if (!secretKey) {
  //       throw new Error("Secret key is not defined");
  //     }

  //     // Create transfer body
  //     const body = await wallet.methods.transfer({
  //       secretKey: secretKey,
  //       toAddress: tonWalletAddress,
  //       amount: amountInNanotons,
  //       seqno: seqno,
  //       payload: 'Automatic transfer'
  //     }).getQuery();

  //     // Send transaction
  //     const result = await tonweb.provider.sendBoc(body.toBoc().toString());
  //     console.log("Transaction sent:", result);

  //     // Calculate dollar amount
  //     if (tonPrice !== null) {
  //       const dollarValue = parseFloat(tonAmount) * tonPrice;
  //       setDollarAmount(dollarValue);
  //     }

  //     // Get transaction hash from result
  //     const hashHex = result.hash;
  //     setTransactionHash(hashHex);
  //     startChecking(hashHex);
      
  //     return hashHex;

  //   } catch (error) {
  //     console.error("Error sending transaction:", error);
  //     throw error;
  //   }
  // };

  // const handleIncreaseWalletBalance = useCallback((amount: number) => {
  //   if (user) {
  //     const newBalance = (user.walletBalance || 0) + amount;
  //     handleUpdateUser({ ...user, walletBalance: newBalance });
  //     setWalletBalance(newBalance);
  //   }
  // }, [user, handleUpdateUser]);

  return (
    <main className="bg-dark-blue text-white flex flex-col items-center min-h-screen">
      {error && (
        <div className="w-full max-w-md bg-red-500 text-white px-4 py-3 rounded-lg mb-4 mt-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <span>{error}</span>
          </div>
          <button 
            onClick={() => setError(null)}
            className="ml-auto pl-3 text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}
      
      {tonWalletAddress ? (
        <div className="text-center w-full">
          <div className="mt-0 p-4 border border-gray-700 rounded-lg bg-gray-800">
            <h2 className="text-xl font-bold mb-4">
              Receive TON
            </h2>
            <input
              type="number"
              value={tonAmount}
              onChange={(e) => setTonAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded text-white"
              min="0"
              step="0.01"
            />
            <button
              onClick={handleSendToncoin}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Confirm
            </button>
          </div>

          <p className="mb-4">Connected: {formatAddress(tonWalletAddress)}</p>
          {/* <p className="mb-4">Connected: {formatAddress(tonConnectAddress || 'loading...')}</p> */}

          <button
            onClick={handleWalletAction}
            className="bg-red-500 hover:bg-red-700 w-60 mb-4 text-white font-bold py-2 px-4 rounded"
          >
            Disconnect Wallet
          </button>
          {tonPrice !== null ? (
        <p className="mb-1">TON Price: ${tonPrice.toFixed(2)}</p>
      ) : (
            <p className="mb-1">Loading TON Price...</p>
          )}
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
        <div className="mt-4 text-white p-2 rounded">
          <p className="text-sm">Transaction Message Hash:</p>
          <p className="font-mono text-xs break-all">{transactionHash}</p>
          {/* время тразакции */}
          <p className="text-sm">Transaction Time: {new Date().toLocaleString()}</p>
          {/* сумма транзакции */}
          <p className="text-sm">Transaction Amount: {tonAmount} TON</p>
          {/* адрес отправителя */}
          <p className="text-sm">Sender Address: {formatAddress(tonWalletAddress || '')}</p>
          {/* адрес получателя */}
          <p className="text-sm">Receiver Address: {formatAddress(destinationAddress.toString())}</p>
        </div>
      )}
      {transactionStatus && <h2>Transaction Status: {transactionStatus}</h2>}
      {transactionAmount && <h2>Transaction Amount: {transactionAmount}</h2>}
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
    </main>
  );
}
