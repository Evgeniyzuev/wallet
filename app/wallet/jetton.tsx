import { useState, useEffect } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address, beginCell, toNano } from "@ton/core";
import { useTransactionStatus } from '../hooks/useTransactionStatus';
import { useUser } from '../UserContext';
import { useLanguage } from '../LanguageContext';

const USDT_MASTER_CONTRACT = "EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA"; // TON USDT Master Contract
const USDT_WALLET_ADDRESS = "UQDLvW6egkiYfJ1lryrOQrwe6B0VZuaLpwKudD0cGK-udBpA"; // Specific USDT wallet address

interface JettonTransferProps {
  action: 'sendUsdt' | 'receiveUsdt';
}

export default function JettonTransfer({ action }: JettonTransferProps) {
  const [tonConnectUI] = useTonConnectUI();
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState(USDT_WALLET_ADDRESS); // Default to the specific address
  const { transactionStatus, startChecking } = useTransactionStatus();
  const { user } = useUser();
  const { language } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const translations = {
    ru: {
      enterAmount: 'Введите сумму USDT',
      enterAddress: 'Адрес получателя',
      yourAddress: 'Ваш адрес для получения USDT',
      fixedAddress: 'Фиксированный адрес для USDT',
      send: 'Отправить',
      receive: 'Получить',
      processing: 'Обработка...',
      insufficientBalance: 'Недостаточно средств',
      invalidAmount: 'Неверная сумма',
      invalidAddress: 'Неверный адрес',
      addressCopied: 'Адрес скопирован',
      connectWallet: 'Подключить кошелек',
      disconnectWallet: 'Отключить кошелек',
      loading: 'Загрузка...',
      connected: 'Подключено'
    },
    en: {
      enterAmount: 'Enter USDT amount',
      enterAddress: 'Recipient address',
      yourAddress: 'Your address for receiving USDT',
      fixedAddress: 'Fixed USDT address',
      send: 'Send',
      receive: 'Receive',
      processing: 'Processing...',
      insufficientBalance: 'Insufficient balance',
      invalidAmount: 'Invalid amount',
      invalidAddress: 'Invalid address',
      addressCopied: 'Address copied',
      connectWallet: 'Connect Wallet',
      disconnectWallet: 'Disconnect Wallet',
      loading: 'Loading...',
      connected: 'Connected'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(USDT_WALLET_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
    if (!address) return '';
    try {
      const tempAddress = Address.parse(address).toString();
      return `${tempAddress.slice(0, 4)}...${tempAddress.slice(-4)}`;
    } catch {
      return `${address.slice(0, 4)}...${address.slice(-4)}`;
    }
  };

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

  const receiveJetton = async () => {
    if (!tonConnectUI.connected) {
      setError("Wallet not connected");
      return;
    }

    try {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        setError(t.invalidAmount);
        return;
      }

      // For receive, we're just showing the address where USDT should be sent
      // No actual transaction is performed here
      console.log(`Request to receive ${amount} USDT at address ${USDT_WALLET_ADDRESS}`);
      
      // In a real app, you might want to generate a QR code or create a payment link
    } catch (error) {
      console.error("Error in receive flow:", error);
      setError(error instanceof Error ? error.message : 'Operation failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="bg-gray-800 text-white font-bold py-2 px-4 rounded">
          {t.loading}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-0 p-4 border border-gray-700 rounded-lg bg-gray-800">
      <h2 className="text-xl font-bold mb-4">
        {action === 'sendUsdt' ? 'Send USDT' : 'Receive USDT'}
      </h2>

      {tonConnectUI.connected ? (
        <>
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
              <div className="mb-2">
                <label className="block text-sm text-gray-400 mb-1">{t.enterAddress}</label>
                <input
                  type="text"
                  value={recipientAddress}
                  readOnly
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white opacity-75"
                />
                <p className="text-xs text-gray-500 mt-1">{t.fixedAddress}</p>
              </div>
              <button
                onClick={sendJetton}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                {t.send}
              </button>
            </>
          ) : (
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
              <div className="mb-2">
                <label className="block text-sm text-gray-400 mb-1">{t.enterAddress}</label>
                <input
                  type="text"
                  value={USDT_WALLET_ADDRESS}
                  readOnly
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white opacity-75"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500 mt-1">{t.fixedAddress}</p>
                  <button 
                    onClick={copyToClipboard}
                    className="text-xs bg-gray-600 hover:bg-gray-500 text-white p-1 rounded mt-1"
                  >
                    {copied ? '✓' : '📋'}
                  </button>
                </div>
              </div>
              <button
                onClick={receiveJetton}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                {t.receive}
              </button>
            </>
          )}

          <p className="mt-4 text-center text-sm text-gray-400">
            {t.connected}: {formatAddress(tonConnectUI.account?.address || '')}
          </p>
          
          <button
            onClick={handleWalletAction}
            className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            {t.disconnectWallet}
          </button>
        </>
      ) : (
        <button
          onClick={handleWalletAction}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          {t.connectWallet}
        </button>
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