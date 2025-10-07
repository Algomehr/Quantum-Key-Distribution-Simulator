
import React from 'react';

const Loader = ({ text }: { text: string }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-lg">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-2 border-cyan-400/50 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyan-300 rounded-full shadow-[0_0_8px_#22d3ee]"></div>
        <div
          className="absolute top-1/2 left-1/2 w-8 h-8 transform -translate-x-1/2 -translate-y-1/2"
          style={{ animation: 'orbit 1.5s linear infinite' }}
        >
          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
        </div>
        <div
          className="absolute top-1/2 left-1/2 w-14 h-14 transform -translate-x-1/2 -translate-y-1/2"
          style={{ animation: 'orbit-reverse 2.5s linear infinite' }}
        >
          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
        </div>
      </div>
      <p className="mt-6 text-lg text-cyan-300 font-medium">{text}</p>
      <style>{`
        @keyframes orbit {
          from { transform: translate(-50%, -50%) rotate(0deg) translateX(32px) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg) translateX(32px) rotate(-360deg); }
        }
        @keyframes orbit-reverse {
          from { transform: translate(-50%, -50%) rotate(0deg) translateX(56px) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(-360deg) translateX(56px) rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;