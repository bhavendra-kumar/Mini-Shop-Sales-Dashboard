import React from 'react'
import useFetch from '../hooks/useFetch'

export default function TopProducts({ filters }) {
  const params = {};
  if (filters.start) params.start = filters.start.toISOString();
  if (filters.end) params.end = filters.end.toISOString();
  if (filters.region) params.region = filters.region;

  const { data: rows, loading, error } = useFetch('/sales/top-products', params);

  if (loading) return <div className="text-gray-500">Loading...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div>
      <h3 className="font-semibold mb-2">Top 5 Products</h3>
      {rows.length === 0 ? (
        <p className="text-gray-500">No data available</p>
      ) : (
        <table className="w-full text-sm">
          <thead><tr><th className="text-left">Product</th><th className="text-right">Revenue</th><th className="text-right">Qty</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.name}><td>{r.name}</td><td className="text-right">${r.revenue.toFixed(2)}</td><td className="text-right">{r.quantity}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
