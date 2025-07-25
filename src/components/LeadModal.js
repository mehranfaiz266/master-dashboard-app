import React, { useEffect, useState } from 'react';

export default function LeadModal({ lead, onClose, onSave }) {
  const [disposition, setDisposition] = useState('');

  useEffect(() => {
    if (lead) {
      setDisposition(lead.disposition);
    }
  }, [lead]);

  if (!lead) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...lead, disposition });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-8 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Edit Lead</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300">Phone Number</label>
            <p className="mt-1 text-white">{lead.phoneNumber}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300">Disposition</label>
            <select
              value={disposition}
              onChange={e => setDisposition(e.target.value)}
              className="mt-1 w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Hot">Hot</option>
              <option value="Warm">Warm</option>
              <option value="Cold">Cold</option>
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
