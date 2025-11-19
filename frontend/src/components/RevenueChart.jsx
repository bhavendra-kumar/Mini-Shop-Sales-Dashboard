import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'

export default function RevenueChart({ data = [], group }) {
  const formatted = data.map(d => ({ period: d.period, revenue: Number(d.revenue.toFixed ? d.revenue.toFixed(2) : d.revenue) }));
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Revenue ({group})</h2>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={formatted}>
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <CartesianGrid strokeDasharray="3 3" />
            <Line type="monotone" dataKey="revenue" stroke="#2563eb" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
