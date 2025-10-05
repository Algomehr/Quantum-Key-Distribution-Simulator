import React from 'react';
import { Basis, Bit, Protocol } from '../types';
import type { SimulationResult, Qubit } from '../types';
import { RectilinearIcon, DiagonalIcon, BitIcon } from './icons/BasisIcons';

const QubitLane: React.FC<{ qubit: Qubit }> = ({ qubit }) => {
  const getBasisIcon = (basis: Basis) => {
    return basis === Basis.Rectilinear ? <RectilinearIcon /> : <DiagonalIcon />;
  };

  const statusClass = !qubit.basisMatch ? 'opacity-30' : 
                      qubit.keyMatch === false ? 'bg-red-500 bg-opacity-20 border-red-500' : 'bg-green-500 bg-opacity-10 border-green-500';

  return (
    <div className={`flex items-center p-2 border-b border-gray-700 transition-all duration-500 ${statusClass}`}>
      <div className="w-1/12 text-center font-mono text-sm">{qubit.id + 1}</div>
      
      {/* Alice */}
      <div className="w-2/12 flex items-center justify-center space-x-2">
        <BitIcon bit={qubit.aliceBit} />
        {getBasisIcon(qubit.aliceBasis)}
      </div>

      {/* Channel & Eve */}
      <div className="w-3/12 text-center text-2xl">
        {qubit.eveInterfered ? '👁️' : qubit.channelError ? '⚡' : '—'}
      </div>

      {/* Bob */}
      <div className="w-3/12 flex items-center justify-center space-x-2">
        {getBasisIcon(qubit.bobBasis)}
        <BitIcon bit={qubit.bobBit} />
      </div>

      {/* Result */}
      <div className="w-3/12 flex items-center justify-center text-lg space-x-2">
        {qubit.basisMatch ? <span title="Basis Match">✅</span> : <span title="Basis Mismatch">❌</span>}
        {qubit.basisMatch && (qubit.keyMatch ? <span className="text-green-400" title="Key Match">✔</span> : <span className="text-red-400" title="Key Mismatch">✖</span>)}
      </div>
    </div>
  );
};

export const SimulationView: React.FC<{ result: SimulationResult | null, protocol: Protocol }> = ({ result, protocol }) => {
  if (!result) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-gray-800 border-2 border-dashed border-gray-600 rounded-xl">
        <p className="text-gray-400 text-lg">برای مشاهده نتایج، شبیه‌سازی را شروع کنید.</p>
      </div>
    );
  }

  const isBB84 = protocol === 'BB84';
  const qubitsToShow = result.qubits.slice(0, 50); // Show first 50 for performance

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 max-h-[80vh] overflow-y-auto">
      <div className="sticky top-0 bg-gray-800 z-10 py-2">
        <div className="flex items-center p-2 font-bold text-gray-300 text-sm border-b-2 border-cyan-500">
          <div className="w-1/12 text-center">#</div>
          <div className="w-2/12 text-center">{isBB84 ? 'آلیس (ارسال)' : 'آلیس (اندازه‌گیری)'}</div>
          <div className="w-3/12 text-center">{isBB84 ? 'کانال / Eve' : 'منبع / Eve'}</div>
          <div className="w-3/12 text-center">{isBB84 ? 'باب (دریافت)' : 'باب (اندازه‌گیری)'}</div>
          <div className="w-3/12 text-center">نتیجه</div>
        </div>
      </div>
      <div className="divide-y divide-gray-700">
        {qubitsToShow.map((qubit) => (
          <QubitLane key={qubit.id} qubit={qubit} />
        ))}
        {result.qubits.length > 50 && <p className="text-center text-sm text-gray-500 p-2">... و {result.qubits.length - 50} کیوبیت دیگر</p>}
      </div>
    </div>
  );
};
