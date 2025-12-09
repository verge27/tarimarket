import { useState, useEffect, useCallback } from 'react';

export interface Currency {
  code: string;
  name: string;
  type: 'fiat' | 'crypto';
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  // Fiat
  { code: 'USD', name: 'US Dollar', type: 'fiat' },
  { code: 'EUR', name: 'Euro', type: 'fiat' },
  { code: 'GBP', name: 'British Pound', type: 'fiat' },
  { code: 'CAD', name: 'Canadian Dollar', type: 'fiat' },
  { code: 'AUD', name: 'Australian Dollar', type: 'fiat' },
  { code: 'JPY', name: 'Japanese Yen', type: 'fiat' },
  { code: 'CHF', name: 'Swiss Franc', type: 'fiat' },
  { code: 'CNY', name: 'Chinese Yuan', type: 'fiat' },
  { code: 'INR', name: 'Indian Rupee', type: 'fiat' },
  { code: 'MXN', name: 'Mexican Peso', type: 'fiat' },
  { code: 'BRL', name: 'Brazilian Real', type: 'fiat' },
  { code: 'RUB', name: 'Russian Ruble', type: 'fiat' },
  // Crypto
  { code: 'BTC', name: 'Bitcoin', type: 'crypto' },
  { code: 'ETH', name: 'Ethereum', type: 'crypto' },
  { code: 'XMR', name: 'Monero', type: 'crypto' },
  { code: 'LTC', name: 'Litecoin', type: 'crypto' },
  { code: 'SOL', name: 'Solana', type: 'crypto' },
  { code: 'DOGE', name: 'Dogecoin', type: 'crypto' },
];

interface RateCache {
  [key: string]: {
    rate: number;
    timestamp: number;
  };
}

const rateCache: RateCache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useCurrencyConversion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiatRate = async (fromCurrency: string): Promise<number | null> => {
    if (fromCurrency === 'USD') return 1;
    
    try {
      // Using exchangerate-api.com free tier (no key required for basic usage)
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch rate');
      
      const data = await response.json();
      return data.rates?.USD || null;
    } catch {
      return null;
    }
  };

  const fetchCryptoRate = async (cryptoCode: string): Promise<number | null> => {
    try {
      // Map our codes to CoinGecko IDs
      const coinGeckoIds: Record<string, string> = {
        BTC: 'bitcoin',
        ETH: 'ethereum',
        XMR: 'monero',
        LTC: 'litecoin',
        SOL: 'solana',
        DOGE: 'dogecoin',
      };
      
      const id = coinGeckoIds[cryptoCode];
      if (!id) return null;
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`
      );
      
      if (!response.ok) throw new Error('Failed to fetch crypto rate');
      
      const data = await response.json();
      return data[id]?.usd || null;
    } catch {
      return null;
    }
  };

  const getUsdRate = useCallback(async (currencyCode: string): Promise<number | null> => {
    if (currencyCode === 'USD') return 1;
    
    // Check cache first
    const cached = rateCache[currencyCode];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.rate;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
      if (!currency) {
        throw new Error('Unsupported currency');
      }
      
      let rate: number | null;
      
      if (currency.type === 'fiat') {
        rate = await fetchFiatRate(currencyCode);
      } else {
        rate = await fetchCryptoRate(currencyCode);
      }
      
      if (rate === null) {
        throw new Error('Could not fetch rate');
      }
      
      // Cache the rate
      rateCache[currencyCode] = {
        rate,
        timestamp: Date.now(),
      };
      
      setLoading(false);
      return rate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
      return null;
    }
  }, []);

  const convertToUsd = useCallback(async (amount: number, fromCurrency: string): Promise<number | null> => {
    if (fromCurrency === 'USD') return amount;
    
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === fromCurrency);
    if (!currency) return null;
    
    const rate = await getUsdRate(fromCurrency);
    if (rate === null) return null;
    
    // For fiat: rate is how many USD per 1 unit of foreign currency
    // For crypto: rate is the USD price of the crypto
    if (currency.type === 'fiat') {
      return amount * rate;
    } else {
      return amount * rate;
    }
  }, [getUsdRate]);

  return {
    loading,
    error,
    getUsdRate,
    convertToUsd,
    currencies: SUPPORTED_CURRENCIES,
  };
};
