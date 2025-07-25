import React from 'react';

export default function KpiCard({ title, value, statusColor }) {
  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <p className={`mt-2 text-3xl font-bold ${statusColor || 'text-white'}`}>{value}</p>
    </div>
  );
}
