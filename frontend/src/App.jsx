import React, { useEffect, useState } from 'react'
import Filters from './components/Filters'
import RevenueChart from './components/RevenueChart'
import TopProducts from './components/TopProducts'
import CategoryContribution from './components/CategoryContribution'
import RegionTrends from './components/RegionTrends'
import ExportCSV from './components/ExportCSV'
import useFetch from './hooks/useFetch'

export default function App() {
  const [filters, setFilters] = useState({ start: null, end: null, region: '', group: 'month' });
  const [summary, setSummary] = useState([]);

  const params = {};
  if (filters.start) params.start = filters.start.toISOString();
  if (filters.end) params.end = filters.end.toISOString();
  if (filters.region) params.region = filters.region;
  if (filters.group) params.group = filters.group;

  const { data, loading, error } = useFetch('/sales/summary', params);

  useEffect(() => {
    setSummary(data);
  }, [data]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">B-Shop Sales Dashboard</h1>
        <Filters filters={filters} setFilters={setFilters} />

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white p-4 rounded shadow">
            {loading ? <div className="text-gray-500">Loading revenue chart...</div> : (
              <>
                <RevenueChart data={summary} group={filters.group} />
                <ExportCSV data={summary} filename="revenue.csv" />
              </>
            )}
          </div>
          <div className="space-y-6">
            <div className="bg-white p-4 rounded shadow">
              <TopProducts filters={filters} />
            </div>
            <div className="bg-white p-4 rounded shadow">
              <CategoryContribution filters={filters} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow mt-6">
          <RegionTrends filters={filters} />
        </div>
      </div>
    </div>
  )
}
