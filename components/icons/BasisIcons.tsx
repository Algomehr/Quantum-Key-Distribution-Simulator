
import React from 'react';

export const RectilinearIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

export const DiagonalIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const BitIcon = ({ bit }: { bit: number }) => (
    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${bit === 0 ? 'bg-blue-400 text-blue-900' : 'bg-yellow-400 text-yellow-900'}`}>
        {bit}
    </div>
);
