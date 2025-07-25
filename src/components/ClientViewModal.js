import React from 'react';

export default function ClientViewModal({ client, onClose }) {
  if (!client) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Client Details</h2>
        <div className="space-y-3 text-white text-sm">
          <p><span className="font-semibold text-gray-300">Company:</span> {client.companyName}</p>
          <p><span className="font-semibold text-gray-300">Contact Name:</span> {client.contactFullName || client.clientName}</p>
          <p><span className="font-semibold text-gray-300">Email:</span> {client.contactEmail}</p>
          {client.contactPhone && (
            <p><span className="font-semibold text-gray-300">Phone:</span> {client.contactPhone}</p>
          )}
          {client.contactPerson && (
            <p><span className="font-semibold text-gray-300">Assigned Person:</span> {client.contactPerson}</p>
          )}
          {client.status && (
            <p><span className="font-semibold text-gray-300">Status:</span> {client.status}</p>
          )}
          {client.leads !== undefined && (
            <p><span className="font-semibold text-gray-300">Leads:</span> {client.leads}</p>
          )}
        </div>
        <div className="mt-8 flex justify-end">
          <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg text-gray-300 hover:bg-gray-700">Close</button>
        </div>
      </div>
    </div>
  );
}
