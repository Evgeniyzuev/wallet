'use client'

import { useEffect, useState } from 'react'
import { useUser } from '../UserContext';
// import ReceivePopup from '../components/ReceivePopup';
import TonConnect from './tonconnect';
import Send from './send';
import JettonTransfer from './jetton';
// import { useTonPrice } from '../TonPriceContext';
import { useLanguage } from '../LanguageContext';
import TonWeb from 'tonweb';

// USDT Jetton wallet address
const USDT_WALLET_ADDRESS = "UQDLvW6egkiYfJ1lryrOQrwe6B0VZuaLpwKudD0cGK-udBpA";

type Currency = {
  code: string;
  symbol: string;
  rate: number; // Exchange rate from USD
};

// Add translations object
const translations = {
  ru: {
    send: 'Отправить',
    receive: 'Получить',
    upCore: 'В ядро',
    scan: 'Скан',
    exchange: 'Обмен',
    buyTon: 'Купить TON',
    enterAmount: 'Введите сумму',
    confirm: 'Подтвердить',
    loading: 'Загрузка...',
    enableBiometrics: 'Включите биометрию',
    forTransactions: 'для подтверждения транзакций',
    insufficientBalance: 'Недостаточно средств',
    negativeAmount: 'Отрицательная сумма',
    invalidAmount: 'Неверная сумма',
    sendTon: 'Отправить TON',
    sendUsdt: 'Отправить USDT',
    receiveTon: 'Получить TON',
    receiveUsdt: 'Получить USDT'
  },
  en: {
    send: 'Send',
    receive: 'Receive',
    upCore: 'Up Core',
    scan: 'Scan',
    exchange: 'Exchange',
    buyTon: 'Buy TON',
    enterAmount: 'Enter amount',
    confirm: 'Confirm',
    loading: 'Loading...',
    enableBiometrics: 'Enable biometrics',
    forTransactions: 'for transaction confirmation',
    insufficientBalance: 'Insufficient balance',
    negativeAmount: 'Negative amount',
    invalidAmount: 'Invalid amount',
    sendTon: 'Send TON',
    sendUsdt: 'Send USDT',
    receiveTon: 'Receive TON',
    receiveUsdt: 'Receive USDT'
  }
}

export default function Wallet() {
  const { user, handleUpdateUser } = useUser();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  // const [isReceivePopupOpen, setIsReceivePopupOpen] = useState(false);
  const [isTransactionInProgress, setIsTransactionInProgress] = useState(false);
  // const { tonPrice } = useTonPrice();
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedCurrency') || 'USD';
    }
    return 'USD';
  });
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    RUB: 92.5,
    CNY: 7.2,
    INR: 83.2
  });
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  const [usdtBalance, setUsdtBalance] = useState<string>('0');
  const [cryptoRates, setCryptoRates] = useState<Record<string, number>>({
    TON: 0,
    USDT: 1 // USDT обычно привязан к доллару (1:1)
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const currencies: Record<string, Currency> = {
    USD: { code: 'USD', symbol: '$', rate: 1 },
    RUB: { code: 'RUB', symbol: '₽', rate: exchangeRates.RUB },
    CNY: { code: 'CNY', symbol: '¥', rate: exchangeRates.CNY },
    INR: { code: 'INR', symbol: '₹', rate: exchangeRates.INR }
  };

  // Calculate TON amount from USD balance using actual exchange rate
  const getTonAmount = () => {
    if (!cryptoRates.TON || !user?.walletBalance) return 0;
    return user.walletBalance / cryptoRates.TON;
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
      console.error(t.invalidAmount);
      return;
    }

    let amountNumber = Number(amount);
    let result;

    try {
      setIsTransactionInProgress(true); // Set the transaction in progress state

      if (selectedAction === 'upCore') {
        // Handle topUpCore action handleIncreaseAicoreBalance
        if (amountNumber > (user?.walletBalance || 0)) {
          console.error(t.insufficientBalance);
          return;
        }
        if (amountNumber <= 0) {
          console.error(t.negativeAmount);
          return;
        }
        result = await handleUpdateUser({
          walletBalance: -amountNumber,
          aicoreBalance: amountNumber
        });

        if (amountNumber >= 1) {
          localStorage.setItem('task6Completed', 'true');
        }
        

        console.log('Top Up Core action not implemented yet');
      } else {
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

  const formatBalance = (balance: number, currency: Currency) => {
    const converted = balance * currency.rate;
    return `${currency.symbol}${converted.toFixed(2)}`;
  };

  // Fetch exchange rates from API
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        // Fetch fiat currency exchange rates
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        
        setExchangeRates({
          RUB: data.rates.RUB,
          CNY: data.rates.CNY,
          INR: data.rates.INR
        });

        // Fetch crypto exchange rates from CoinGecko
        const cryptoResponse = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=the-open-network,tether&vs_currencies=usd'
        );
        const cryptoData = await cryptoResponse.json();
        
        setCryptoRates({
          TON: cryptoData['the-open-network']?.usd || 0,
          USDT: cryptoData['tether']?.usd || 1
        });

        setLastUpdated(new Date());

        console.log('Crypto rates updated:', {
          TON: cryptoData['the-open-network']?.usd,
          USDT: cryptoData['tether']?.usd
        });
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
      }
    };

    fetchExchangeRates();
    // Обновляем курсы каждые 5 минут для криптовалют
    const interval = setInterval(fetchExchangeRates, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch USDT balance
  useEffect(() => {
    const fetchUsdtBalance = async () => {
      try {
        // Initialize TonWeb
        const tonweb = new TonWeb(new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC', {
          apiKey: process.env.NEXT_PUBLIC_MAINNET_TONCENTER_API_KEY
        }));
        
        // Get Jetton wallet info
        const response = await fetch(`https://tonapi.io/v2/accounts/${USDT_WALLET_ADDRESS}/jettons`);
        const data = await response.json();
        
        if (data && data.balances && data.balances.length > 0) {
          // Find USDT balance (assuming it's in the list)
          const usdtInfo = data.balances.find((item: any) => 
            item.jetton.name === "Tether USD" || 
            item.jetton.symbol === "USDT"
          );
          
          if (usdtInfo) {
            // USDT has 6 decimals
            const balance = Number(usdtInfo.balance) / 1000000;
            setUsdtBalance(balance.toFixed(2));
          }
        }
      } catch (error) {
        console.error('Error fetching USDT balance:', error);
      }
    };

    fetchUsdtBalance();
    // Refresh balance every 60 seconds
    const interval = setInterval(fetchUsdtBalance, 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="bg-dark-blue text-white flex flex-col items-center min-h-screen">
      <div className="text-center w-full max-w-lg px-4">
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-4 mt-4 ml-4">
            <div>
              <p className="text-4xl text-bold">
                {selectedCurrency === 'USD' 
                  ? `$${Number((user?.walletBalance || 0)).toFixed(2)}`
                  : formatBalance(user?.walletBalance || 0, currencies[selectedCurrency])}
              </p>
            </div>
            <button
              onClick={() => setShowCurrencySelector(!showCurrencySelector)}
              className="text-2xl text-gray-400 hover:text-gray-300 focus:outline-none"
            >
              💱
            </button>
            <div className="text-right">
              {cryptoRates.TON > 0 && (
                <p className="text-xs text-gray-500">TON: ${cryptoRates.TON.toFixed(2)}</p>
              )}
              {/* <p className="text-2xl text-gray-400">
                {cryptoRates.TON ? `${getTonAmount().toFixed(2)} TON` : t.loading}
              </p> */}
              {lastUpdated && (
                <p className="text-xs text-gray-500">
                  {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          
           {showCurrencySelector && (
          <div className="absolute mt-0 ml-4 bg-gray-800 rounded-lg shadow-lg z-50">
            {Object.entries(currencies).map(([code, currency]) => (
              <button
                key={code}
                onClick={() => {
                  setSelectedCurrency(code);
                  setShowCurrencySelector(false);
                  localStorage.setItem('selectedCurrency', code);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-700 ${
                  selectedCurrency === code ? 'text-blue-400' : 'text-white'
                }`}
              >
                {currency.code}
              </button>
            ))}
          </div>
        )}
        </div>
        
       
        
        <div className="grid grid-cols-3 gap-1 mb-8">
          <div className="col-span-3 grid grid-cols-2 gap-1 mb-1">
            <button 
              onClick={() => handleButtonClick('sendTon')}
              className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all"
            >
              <span className="text-2xl mb-2">↑</span>
              <span className="text-sm">{t.sendTon}</span>
            </button>

            <button 
              onClick={() => handleButtonClick('sendUsdt')}
              className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all"
            >
              <span className="text-2xl mb-2">↑</span>
              <span className="text-sm">{t.sendUsdt}</span>
            </button>
          </div>

          <div className="col-span-3 grid grid-cols-2 gap-1 mb-1">
            <button 
              onClick={() => handleButtonClick('receiveTon')}
              className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all"
            >
              <span className="text-2xl mb-2">↓</span>
              <span className="text-sm">{t.receiveTon}</span>
            </button>

            <button 
              onClick={() => handleButtonClick('receiveUsdt')}
              className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all"
            >
              <span className="text-2xl mb-2">↓</span>
              <span className="text-sm">{t.receiveUsdt}</span>
            </button>
          </div>

          <button 
            onClick={() => handleButtonClick('upCore')}
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all"
          >
            <span className="text-2xl mb-2">↗</span>
            <span className="text-sm">{t.upCore}</span>
          </button>

          <button 
            onClick={() => handleButtonClick('scan')}
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all"
          >
            <span className="text-2xl mb-2">⟲</span>
            <span className="text-sm">{t.scan}</span>
          </button>

          <button 
            onClick={() => handleButtonClick('exchange')}
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all"
          >
            <span className="text-2xl mb-2">↑↓</span>
            <span className="text-sm">{t.exchange}</span>
          </button>

          <button 
            onClick={() => handleButtonClick('buy')}
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all"
          >
            <span className="text-2xl mb-2">$</span>
            <span className="text-sm">{t.buyTon}</span>
          </button>


        </div>

        {( selectedAction === 'upCore') && (
          <div className="mt-8 p-4 border border-gray-700 rounded-lg bg-gray-800 max-w-lg mx-auto">
            <h2 className="text-xl font-bold mb-4">
              {selectedAction}
            </h2>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t.enterAmount}
              className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded text-white"
              min="0" // Prevent negative values
            />
            <button
              onClick={handleActionSubmit}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              {t.confirm}
            </button>
          </div>
        )}
        
        {selectedAction === 'receiveTon' && <TonConnect />}
        {selectedAction === 'sendTon' && <Send />}
        {(selectedAction === 'sendUsdt' || selectedAction === 'receiveUsdt') && <JettonTransfer action={selectedAction} />}

        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-xl">👆</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm">{t.enableBiometrics}</span>
                <span className="text-xs text-gray-400">{t.forTransactions}</span>
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
