import React from 'react';

export default function NavLink({ icon, text, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-3 w-full text-left p-3 rounded-lg font-semibold transition-colors duration-200 ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}
