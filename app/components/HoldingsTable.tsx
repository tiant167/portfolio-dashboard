'use client';

interface Holding {
  symbol: string;
  shares: number;
  category: string;
  currentPrice: number;
  value: number;
}

interface HoldingsTableProps {
  holdings: Holding[];
}

export default function HoldingsTable({ holdings }: HoldingsTableProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Current Holdings</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Symbol</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Shares</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Current Price</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Value</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding) => (
              <tr key={holding.symbol} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900 font-medium">{holding.symbol}</td>
                <td className="py-3 px-4 text-right text-gray-700">{holding.shares}</td>
                <td className="py-3 px-4 text-right text-gray-700">
                  ${holding.currentPrice.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-right text-gray-900 font-semibold">
                  ${holding.value.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-gray-700">{holding.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
