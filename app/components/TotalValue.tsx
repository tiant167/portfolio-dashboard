'use client';

interface TotalValueProps {
  value: number;
}

export default function TotalValue({ value }: TotalValueProps) {
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">Total Portfolio Value</h2>
      <p className="text-5xl font-bold text-blue-600">{formattedValue}</p>
    </div>
  );
}
