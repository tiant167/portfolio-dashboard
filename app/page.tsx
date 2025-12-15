'use client';

import { useEffect, useState } from 'react';
import TotalValue from './components/TotalValue';
import PortfolioPieChart from './components/PortfolioPieChart';
import HoldingsTable from './components/HoldingsTable';

interface Holding {
  symbol: string;
  shares: number;
  category: string;
  currentPrice: number;
  value: number;
}

interface PortfolioData {
  totalCurrentValue: number;
  categorizedValues: { [category: string]: number };
  holdings: Holding[];
  categoriesConfig: { [category: string]: string };
}

export default function Home() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Local full-response cache (single cache for both portfolio payload and per-symbol prices)
        const PORTFOLIO_CACHE_KEY = 'portfolio-cache-v1';
        const CACHE_TTL = 1000 * 60 * 60; // 1 hour

        type PortfolioCache = { ts: number; payload: PortfolioData };

        const loadPortfolioCache = (): PortfolioCache | null => {
          try {
            const raw = localStorage.getItem(PORTFOLIO_CACHE_KEY);
            if (!raw) return null;
            return JSON.parse(raw) as PortfolioCache;
          } catch {
            return null;
          }
        };

        const savePortfolioCache = (payload: PortfolioData) => {
          try {
            const entry: PortfolioCache = { ts: Date.now(), payload };
            localStorage.setItem(PORTFOLIO_CACHE_KEY, JSON.stringify(entry));
          } catch {
            // ignore
          }
        };

        // Use full cached portfolio if it's fresh
        const pCache = loadPortfolioCache();
        if (pCache && Date.now() - pCache.ts <= CACHE_TTL) {
          setPortfolioData(pCache.payload as PortfolioData);
          setLoading(false);
          return;
        }

        // Not using cache (or cache expired): call API and then update cache
        const response = await fetch('/api/portfolio');
        if (!response.ok) {
          throw new Error('Failed to fetch portfolio data');
        }
        const data = await response.json();

        // If previous cache exists (even expired), use it as a source of previously-known prices
        const oldCache = pCache;

        // Now build adjusted holdings: prefer API price; if missing, fall back to previous cached price for the same symbol
        const adjustedHoldings = ((data.holdings as Holding[]) || []).map((h: Holding) => {
          const apiPrice = typeof h.currentPrice === 'number' && h.currentPrice > 0 ? h.currentPrice : null;
          if (apiPrice) return { ...h };
          // try to find price in previous cache
          const prev = oldCache?.payload?.holdings?.find((ph: Holding) => ph.symbol === h.symbol && typeof ph.currentPrice === 'number' && ph.currentPrice > 0) as Holding | undefined;
          if (prev) {
            return { ...h, currentPrice: prev.currentPrice, value: prev.currentPrice * (h.shares || 0) };
          }
          return { ...h };
        });

        // Recompute totals and categories using adjustedHoldings and server cash
        const categorizedValues: { [k: string]: number } = {};
        let totalCurrentValue = 0;
        adjustedHoldings.forEach((h: Holding) => {
          const val = typeof h.value === 'number' ? h.value : (h.currentPrice || 0) * (h.shares || 0);
          totalCurrentValue += val;
          const cat = h.category || 'Uncategorized';
          categorizedValues[cat] = (categorizedValues[cat] || 0) + val;
        });
        const serverCash = data.categorizedValues && typeof data.categorizedValues['Cash'] === 'number' ? data.categorizedValues['Cash'] : 0;
        if (serverCash > 0) {
          categorizedValues['Cash'] = serverCash;
          totalCurrentValue += serverCash;
        }

        const adjusted = {
          totalCurrentValue,
          categorizedValues,
          holdings: adjustedHoldings,
          categoriesConfig: data.categoriesConfig || {},
        } as PortfolioData;

        // Persist full portfolio payload to cache (store the adjusted object so cached UI is ready-to-use)
        try {
          savePortfolioCache(adjusted);
        } catch {
          // ignore
        }

        setPortfolioData(adjusted);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">Loading portfolio data...</p>
      </div>
    );
  }

  if (error || !portfolioData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error || 'Failed to load portfolio data'}</p>
        </div>
      </div>
    );
  }

  // Prepare pie chart data
  const pieChartData = Object.entries(portfolioData.categorizedValues).map(([category, value]) => ({
    name: category,
    value: value,
    color: portfolioData.categoriesConfig[category] || '#999999',
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Portfolio Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your investment portfolio</p>
        </div>

        {/* Total Value Card */}
        <div className="mb-8">
          <TotalValue value={portfolioData.totalCurrentValue} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <div>
            <PortfolioPieChart data={pieChartData} />
          </div>

          {/* Category Breakdown Table */}
          <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Category Breakdown</h2>
            <div className="space-y-3">
              {Object.entries(portfolioData.categorizedValues).map(([category, value]) => (
                <div key={category} className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: portfolioData.categoriesConfig[category] || '#999999' }}
                    />
                    <span className="text-gray-700 font-medium">{category}</span>
                  </div>
                  <span className="text-gray-900 font-semibold">
                    ${value.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="mb-8">
          <HoldingsTable
            holdings={portfolioData.holdings}
            totalValue={portfolioData.totalCurrentValue}
            cashValue={portfolioData.categorizedValues['Cash'] || 0}
          />
        </div>
      </div>
    </div>
  );
}
