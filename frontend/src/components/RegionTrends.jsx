import React, { useEffect, useState } from 'react'
import useFetch from '../hooks/useFetch'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'

const COLORS = ['#2563eb', '#f97316', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4']

export default function RegionTrends({ filters }) {
  const [data, setData] = useState([])
  const [regions, setRegions] = useState([])

  const params = { group: filters.group || 'month' }
  if (filters.start) params.start = filters.start.toISOString()
  if (filters.end) params.end = filters.end.toISOString()

  const { data: map, loading, error } = useFetch('/sales/region-trends', params)

  useEffect(() => {
    if (!map || typeof map !== 'object') return

    const periodSet = new Set()
    Object.values(map).forEach(arr => arr.forEach(r => periodSet.add(r.period)))
    const periods = Array.from(periodSet).sort()

    const rows = periods.map(p => {
      const row = { period: p }
      for (const reg of Object.keys(map)) {
        const item = map[reg].find(x => x.period === p)
        row[reg] = item ? item.revenue : 0
      }
      return row
    })

    setData(rows)
    setRegions(Object.keys(map))
  }, [map])

  if (loading) return <div className="text-gray-500">Loading...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Regional Trends</h3>
      {data.length === 0 ? (
        <p className="text-gray-500">No data available</p>
      ) : (
        <div style={{ width: '100%', height: 360 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Legend />
              {regions.map((r, i) => (
                <Line key={r} type="monotone" dataKey={r} stroke={COLORS[i % COLORS.length]} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
