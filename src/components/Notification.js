import React from 'react';

export default function Notification({ message, onClose }) {
  if (!message) return null;
  const bg = message.type === 'error' ? 'bg-red-600' : 'bg-green-600';
  return (
    <div className={`${bg} text-white px-4 py-2 rounded mb-4 flex justify-between items-center`}>
      <span>{message.text}</span>
      <button onClick={onClose} className="font-bold">×</button>
    </div>
  );
}
