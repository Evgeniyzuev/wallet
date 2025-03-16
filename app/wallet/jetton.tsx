import { useState, useEffect } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address, beginCell, toNano } from "@ton/core";
import { useTransactionStatus } from '../hooks/useTransactionStatus';
import { useUser } from '../UserContext';
import { useLanguage } from '../LanguageContext';

const USDT_MASTER_CONTRACT = "EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA"; // TON USDT Master Contract

interface JettonTransferProps {
  action: 'sendUsdt' | 'receiveUsdt';
}

export default function JettonTransfer({ action }: JettonTransferProps) {
  const [tonConnectUI] = useTonConnectUI();
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const { transactionStatus, startChecking } = useTransactionStatus();
  const { user } = useUser();
  const { language } = useLanguage();
  const [error, setError] = useState<string | null>(null);

  const translations = {
    ru: {
      enterAmount: 'Введите сумму USDT',
      enterAddress: 'Введите адрес получателя',
      yourAddress: 'Ваш адрес для получения USDT',
      send: 'Отправить',
      receive: 'Получить',
      processing: 'Обработка...',
      insufficientBalance: 'Недостаточно средств',
      invalidAmount: 'Неверная сумма',
      invalidAddress: 'Неверный адрес'
    },
    en: {
      enterAmount: 'Enter USDT amount',
      enterAddress: 'Enter recipient address',
      yourAddress: 'Your address for receiving USDT',
      send: 'Send',
      receive: 'Receive',
      processing: 'Processing...',
      insufficientBalance: 'Insufficient balance',
      invalidAmount: 'Invalid amount',
      invalidAddress: 'Invalid address'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const sendJetton = async () => {
    if (!tonConnectUI.connected) {
      setError("Wallet not connected");
      return;
    }

    try {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        setError(t.invalidAmount);
        return;
      }

      try {
        // Validate address by attempting to parse it
        Address.parse(recipientAddress);
      } catch {
        setError(t.invalidAddress);
        return;
      }

      // Create transfer payload for Jetton
      const body = beginCell()
        .storeUint(0xf8a7ea5, 32) // op transfer
        .storeUint(0, 64) // queryId
        .storeCoins(toNano(amount)) // amount in smallest units
        .storeAddress(Address.parse(recipientAddress))
        .storeAddress(Address.parse(recipientAddress)) // response address
        .storeBit(0) // no custom payload
        .storeCoins(toNano("0.05")) // forward amount for notification
        .storeBit(0) // no forward payload
        .endCell();

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60,
        messages: [
          {
            address: USDT_MASTER_CONTRACT,
            amount: toNano("0.1").toString(), // Convert bigint to string
            payload: body.toBoc().toString('base64'),
          },
        ],
      };

      const result = await tonConnectUI.sendTransaction(transaction);
      console.log("Jetton transaction sent:", result);
      
      if (result) {
        startChecking(result.boc);
      }
    } catch (error) {
      console.error("Error sending Jetton transaction:", error);
      setError(error instanceof Error ? error.message : 'Transaction failed');
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="mt-0 p-4 border border-gray-700 rounded-lg bg-gray-800">
      <h2 className="text-xl font-bold mb-4">
        {action === 'sendUsdt' ? 'Send USDT' : 'Receive USDT'}
      </h2>

      {action === 'sendUsdt' ? (
        <>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={t.enterAmount}
            className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded text-white"
            min="0"
            step="0.01"
          />
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder={t.enterAddress}
            className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
          <button
            onClick={sendJetton}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            {t.send}
          </button>
        </>
      ) : (
        <div className="text-center">
          <p className="mb-2 text-gray-400">{t.yourAddress}</p>
          <p className="font-mono bg-gray-700 p-3 rounded break-all">
            {tonConnectUI.account?.address ? formatAddress(tonConnectUI.account.address) : t.processing}
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500">
          {error}
        </div>
      )}

      {transactionStatus && (
        <div className={`mt-4 p-3 rounded ${
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
  );
} 