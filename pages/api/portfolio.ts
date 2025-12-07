import { NextApiRequest, NextApiResponse } from 'next';
import { getPortfolioFromEdge } from '../../lib/edge-config';

// Define interfaces for better type safety
interface Holding {
  symbol: string;
  shares: number;
  category: string;
  targetPercentage?: number; // optional target allocation (0-100)
}

interface PortfolioConfig {
  holdings: Holding[];
  cash: number;
  categories: { [key: string]: string };
}

interface HoldingWithPrice extends Holding {
  currentPrice: number;
  value: number;
}

// Function to fetch current stock price from Alpha Vantage
async function fetchCurrentPrice(symbol: string) {
  if (symbol === 'CASH') {
    return 1; // Cash value is 1 per unit
  }
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    throw new Error('ALPHA_VANTAGE_API_KEY is not set');
  }

  const response = await fetch(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
  );
  const data = await response.json();

  if (data['Error Message']) {
    console.error(`Alpha Vantage Error for ${symbol}:`, data['Error Message']);
    return null;
  }

  const globalQuote = data['Global Quote'];
  if (globalQuote && globalQuote['05. price']) {
    return parseFloat(globalQuote['05. price']);
  }
  console.warn(`No current price data for ${symbol}`);
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Read portfolio exclusively from Vercel Edge Config via SDK helper.
    // If not present, return an explicit error so deployment/ops can fix the Edge Config.
    let config: PortfolioConfig | null = null;
    try {
      config = await getPortfolioFromEdge();
    } catch (e) {
      console.warn('Edge Config SDK error', e);
      config = null;
    }

    if (!config) {
      res.status(500).json({ error: 'Portfolio not found in Vercel Edge Config. Please create a key named `portfolio` in Edge Config and add a valid JSON value.' });
      return;
    }

    const { holdings, cash, categories } = config as PortfolioConfig;

    // Fetch current prices for all holdings
    const holdingsWithPrices: HoldingWithPrice[] = await Promise.all(
      holdings.map(async (holding) => {
        const price = await fetchCurrentPrice(holding.symbol);
        return {
          ...holding,
          currentPrice: price || 0,
          value: (price || 0) * holding.shares,
        };
      })
    );

    // Calculate categorized values
    let totalCurrentValue = cash;
    const categorizedValues: { [category: string]: number } = { 'Cash': cash };

    for (const holding of holdingsWithPrices) {
      totalCurrentValue += holding.value;
      categorizedValues[holding.category] = (categorizedValues[holding.category] || 0) + holding.value;
    }

    res.status(200).json({
      totalCurrentValue,
      categorizedValues,
      holdings: holdingsWithPrices,
      categoriesConfig: categories,
    });

  } catch (error) {
    console.error('Error processing portfolio data:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio data.' });
  }
}
