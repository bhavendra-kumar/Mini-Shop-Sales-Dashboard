import React from 'react'
import { format, parseISO } from 'date-fns'

const regions = ['', 'North', 'South', 'East', 'West'];

export default function Filters({ filters, setFilters }) {
  const update = (patch) => setFilters({ ...filters, ...patch });

  return (
    <div className="bg-white p-4 rounded shadow flex flex-col md:flex-row gap-4 items-center">
      <div>
        <label className="block text-sm text-gray-600">Start</label>
        <input type="date" className="border p-2 rounded" onChange={e => update({ start: e.target.value ? parseISO(e.target.value) : null })} />
      </div>
      <div>
        <label className="block text-sm text-gray-600">End</label>
        <input type="date" className="border p-2 rounded" onChange={e => update({ end: e.target.value ? parseISO(e.target.value) : null })} />
      </div>
      <div>
        <label className="block text-sm text-gray-600">Region</label>
        <select className="border p-2 rounded" value={filters.region} onChange={e => update({ region: e.target.value })}>
          {regions.map(r => <option key={r} value={r}>{r || 'All'}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-600">Group</label>
        <select className="border p-2 rounded" value={filters.group} onChange={e => update({ group: e.target.value })}>
          <option value="month">Month</option>
          <option value="quarter">Quarter</option>
        </select>
      </div>
    </div>
  )
}
