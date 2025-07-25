import React, { useEffect, useState } from 'react';

export default function CallNumberModal({ isOpen, onClose, numberData, clients, onSave }) {
  const [form, setForm] = useState({ number: '', clientId: '' });

  useEffect(() => {
    if (numberData) {
      setForm({ number: numberData.number, clientId: numberData.clientId || '' });
    } else {
      setForm({ number: '', clientId: '' });
    }
  }, [numberData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const clientId = form.clientId ? parseInt(form.clientId, 10) : null;
    const payload = { id: numberData?.id || Date.now(), number: form.number, clientId };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-8 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">{numberData ? 'Edit Number' : 'Add Number'}</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300">Number</label>
            <input
              name="number"
              type="text"
              required
              value={form.number}
              onChange={e => setForm({ ...form, number: e.target.value })}
              className="mt-1 w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300">Assign to Client</label>
            <select
              value={form.clientId}
              onChange={e => setForm({ ...form, clientId: e.target.value })}
              className="mt-1 w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Unassigned</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-8 flex justify-end space-x-4">
          <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg text-gray-300 hover:bg-gray-700">Cancel</button>
          <button type="submit" className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-indigo-700">Save</button>
        </div>
      </form>
    </div>
  );
}
