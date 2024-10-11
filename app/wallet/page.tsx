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

// const jettonWalletContract = Address.parse('UQB7cFPcnMxBh5VjuRxtxwXXG8UuqxR3xbQtsuhw0Ezy7Jfz');

const destinationAddress =   Address.parse('UQB7cFPcnMxBh5VjuRxtxwXXG8UuqxR3xbQtsuhw0Ezy7Jfz');
const destinationUsdtAddress =   Address.parse('UQDLvW6egkiYfJ1lryrOQrwe6B0VZuaLpwKudD0cGK-udBpA'); // USDT contract address on TON
const usdtContractAddress = Address.parse('EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs'); // USDT contract address on TON  
 

const forwardPayload = beginCell()
    .storeUint(0, 32) // 0 opcode means we have a comment
    .storeStringTail('Hello, TON!')
    .endCell();

const body = beginCell()
    // .storeUint(0xf8a7ea5, 32) // opcode for jetton transfer
    // .storeUint(0, 64) // query id
    // .storeCoins(toNano("0.5")) // Jetton amount for transfer (decimals = 6 - USDT, 9 - default). Function toNano use decimals = 9 (remember it)
    // .storeAddress(destinationAddress) // TON wallet destination address
    // .storeAddress(destinationAddress) // response excess destination
    // .storeBit(0) // no custom payload
    // .storeCoins(toNano("0.2")) // forward amount (if >0, will send notification message)
    // .storeBit(1) // we store forwardPayload as a reference
    // .storeRef(forwardPayload)
    // .endCell();
    .storeUint(0xf8a7ea5, 32) // op transfer
    .storeUint(0, 64) // queryId
    .storeCoins(toNano(2)) // deposit_amount
    .storeAddress(
      Address.parse(destinationUsdtAddress.toString()),
    ) // receiver address
    .storeAddress(Address.parse(destinationUsdtAddress.toString())) //response_adress - address nhận phí GD thừa
    .storeMaybeRef(null) // custom_payload
    .storeCoins(toNano("0.05")) // forward_ton_amount
    .storeMaybeRef(beginCell().storeStringTail("something").endCell()) // forward_payload_amount if receiver is a smart contract
    .endCell();





export default function WalletPage() {
  const [tonConnectUI] = useTonConnectUI();
  const [tonWalletAddress, setTonWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tonAmount, setTonAmount] = useState('1');
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const { transactionStatus, startChecking } = useTransactionStatus();
  // const [amountToWalletBalance, setAmountToWalletBalance] = useState<number>(0);
  const { user } = useUserData();

  // const Wallet_DST = "UQB7cFPcnMxBh5VjuRxtxwXXG8UuqxR3xbQtsuhw0Ezy7Jfz";
  // const [Wallet_SRC, setWallet_SRC] = useState<string>('');

  // transfer#0f8a7ea5 query_id:uint64 amount:(VarUInteger 16) destination:MsgAddress
  // response_destination:MsgAddress custom_payload:(Maybe ^Cell)
  // forward_ton_amount:(VarUInteger 16) forward_payload:(Either Cell ^Cell)
  // = InternalMsgBody;

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


  const myTransaction = {
    // validUntil: Math.floor(Date.now() / 1000) + 360,
    // messages: [
    // {
    // address: destinationAddress, // sender jetton wallet
    // amount: toNano("2.2").toString(), // for commission fees, excess will be returned
    // payload: body.toBoc().toString("base64") // payload with jetton transfer and comment body
    validUntil: Math.floor(Date.now() / 1000) + 360,
    messages: [
      {
        address: destinationUsdtAddress.toString(), // Your USDT jetton wallet address
        amount: toNano(0.1).toString(), // feee
        payload: body.toBoc().toString("base64"), // payload with jetton transfer and comment body
    }
    ]
    }

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
            address: "UQB7cFPcnMxBh5VjuRxtxwXXG8UuqxR3xbQtsuhw0Ezy7Jfz",
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

  
// хэш транзакции
// const transactionRes = await walletConnect.sendTransaction()
// const cell = Cell.fromBase64(transactionRes.boc)
// const buffer = cell.hash();
// const hashHex = buffer.toString('hex');
// hashHex: 57123dffb9029bdaa9187b5d035737eea94a1b8c018e2ab1885f245eb95c6e30
// const hashBase64 = buffer.toString('base64');


  // transfer#0f8a7ea5 query_id:uint64 amount:(VarUInteger 16) destination:MsgAddress
  // response_destination:MsgAddress custom_payload:(Maybe ^Cell)
  // forward_ton_amount:(VarUInteger 16) forward_payload:(Either Cell ^Cell)
  // = InternalMsgBody;







  // const sendUSDt = async () => {
  //   if (!tonConnectUI.connected || !tonWalletAddress) {
  //     console.log("Wallet not connected");
  //     return;
  //   }

  //   try {
  //     const usdtContractAddress = "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs"; // USDT contract address on TON
  //     const recipientAddress = "UQB7cFPcnMxBh5VjuRxtxwXXG8UuqxR3xbQtsuhw0Ezy7Jfz"; // The recipient's address
  //     const amount = "1000000"; // Amount in minimal units (1 USDT = 1,000,000 units)

  //     const payload = {
  //       abi: {
  //         type: "Contract",
  //         value: {
  //           "ABI version": 2,
  //           "version": "2.2",
  //           "header": ["time", "expire"],
  //           "functions": [
  //             {
  //               "name": "transfer",
  //               "inputs": [
  //                 {"name": "destination", "type": "address"},
  //                 {"name": "tokens", "type": "uint128"},
  //                 {"name": "grams", "type": "uint128"},
  //                 {"name": "return_ownership", "type": "uint128"},
  //                 {"name": "notify", "type": "bool"}
  //               ],
  //               "outputs": []
  //             }
  //           ],
  //           "data": [],
  //           "events": []
  //         }
  //       },
  //       method: "transfer",
  //       params: {
  //         destination: usdtContractAddress,
  //         tokens: amount,
  //         grams: "1000000000", // 0.1 TON for gas
  //         return_ownership: "0",
  //         notify: false
  //       }
  //     };

  //     const transaction = {
  //       validUntil: Math.floor(Date.now() / 1000) + 60, // Valid for 60 seconds
  //       messages: [
  //         {
  //           address: tonWalletAddress,
  //           amount: "1000000000", // 0.1 TON for gas
  //           payload: btoa(JSON.stringify(payload)), // Serialize and encode the payload
  //         },
  //       ],
  //     };

  //     const result = await tonConnectUI.sendTransaction(transaction);
  //     console.log("USDT Transaction sent:", result);
  //   } catch (error) {
  //     console.error("Error sending USDT transaction:", error);
  //   }
  // };

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
          <div>
          {/* <button 
            onClick={() => tonConnectUI.sendTransaction({
              validUntil: myTransaction.validUntil,
              messages: myTransaction.messages.map(msg => ({
                address: msg.address?.toString() || '', // Use optional chaining and provide a fallback
                amount: msg.amount,
                payload: msg.payload
              }))
            })}
          className="bg-green-500 hover:bg-green-700 w-60 mb-4 text-white font-bold py-2 px-4 rounded"
          >
            Send 1,5 USDT
          </button> */}
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
          <p className="text-sm">Receiver Address: {formatAddress(destinationUsdtAddress.toString())}</p>
        </div>
      )}
      <Navigation />
      {transactionStatus && <h2>Transaction Status: {transactionStatus}</h2>}
    </main>
  );
}