import React from 'react'
import useFetch from '../hooks/useFetch'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#2563eb', '#f97316', '#10b981', '#ef4444', '#8b5cf6'];

export default function CategoryContribution({ filters }) {
  const params = {};
  if (filters.start) params.start = filters.start.toISOString();
  if (filters.end) params.end = filters.end.toISOString();
  if (filters.region) params.region = filters.region;

  const { data: raw, loading, error } = useFetch('/sales/category-contribution', params);
  const rows = raw.map(r => ({ name: r.category, value: Number(r.revenue) }));

  if (loading) return <div className="text-gray-500">Loading...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="flex items-center gap-4">
      <div style={{ width: 200, height: 200 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={rows} dataKey="value" nameKey="name" outerRadius={80} fill="#8884d8">
              {rows.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="font-semibold">Category Contribution</h3>
        {rows.length === 0 ? (
          <p className="text-gray-500 text-sm mt-2">No data available</p>
        ) : (
          <ul className="text-sm mt-2">
            {rows.map((r, i) => (
              <li key={r.name}><span style={{ color: COLORS[i % COLORS.length] }}>&#9632;</span> {r.name}: ${r.value.toFixed(2)}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
