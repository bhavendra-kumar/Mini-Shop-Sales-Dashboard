import React from 'react'

function toCSV(rows) {
  if (!rows || !rows.length) return '';
  const keys = Object.keys(rows[0]);
  const lines = [keys.join(',')];
  for (const r of rows) lines.push(keys.map(k => JSON.stringify(r[k] ?? '')).join(','));
  return lines.join('\n');
}

export default function ExportCSV({ data, filename = 'export.csv' }) {
  const download = () => {
    const csv = toCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  return <button onClick={download} className="mt-4 px-3 py-2 bg-blue-600 text-white rounded">Export CSV</button>
}
