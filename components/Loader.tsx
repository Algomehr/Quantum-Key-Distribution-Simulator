
import React from 'react';

const Loader = ({ text }: { text: string }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-800 bg-opacity-50 rounded-lg">
      <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-cyan-400"></div>
      <p className="mt-4 text-lg text-cyan-300">{text}</p>
    </div>
  );
};

export default Loader;
