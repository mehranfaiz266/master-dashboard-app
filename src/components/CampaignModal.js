import React, { useEffect, useState } from 'react';

export default function CampaignModal({ isOpen, onClose, campaignData, clients, numbers, onSave }) {
  const [form, setForm] = useState({ name: '', clientId: '', callNumber: '' });

  useEffect(() => {
    if (campaignData) {
      setForm({
        name: campaignData.name,
        clientId: campaignData.clientId || '',
        callNumber: campaignData.callNumber || '',
      });
    } else {
      setForm({ name: '', clientId: '', callNumber: '' });
    }
  }, [campaignData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      id: campaignData?.id || Date.now(),
      name: form.name,
      clientId: form.clientId,
      callNumber: form.callNumber,
    };
    onSave(payload);
  };

  const availableNumbers = numbers.filter(n => !n.clientId || String(n.clientId) === String(form.clientId));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-8 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">{campaignData ? 'Edit Campaign' : 'Add Campaign'}</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300">Campaign Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              className="mt-1 w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300">Assign to Client</label>
            <select
              value={form.clientId}
              onChange={e => setForm({ ...form, clientId: e.target.value })}
              className="mt-1 w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg"
            >
              <option value="">Unassigned</option>
              {clients.map(c => (
                <option key={c.id} value={c.clientId || c.id}>{c.companyName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300">Call Number</label>
            <select
              value={form.callNumber}
              onChange={e => setForm({ ...form, callNumber: e.target.value })}
              className="mt-1 w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg"
            >
              <option value="">Select Number</option>
              {availableNumbers.map(n => (
                <option key={n.id} value={n.number}>{n.number}</option>
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
