import React from 'react';
import { Basis, Protocol } from '../types';
import type { SimulationResult, Qubit } from '../types';
import { RectilinearIcon, DiagonalIcon, BitIcon, EveIcon, NoiseIcon } from './icons/BasisIcons';

const QubitLane: React.FC<{ qubit: Qubit, protocol: Protocol }> = ({ qubit, protocol }) => {
  const getBasisIcon = (basis: Basis) => {
    return basis === Basis.Rectilinear ? <RectilinearIcon /> : <DiagonalIcon />;
  };

  const statusClass = !qubit.basisMatch ? 'opacity-40' : 
                      qubit.keyMatch === false ? 'bg-red-500/10' : 'bg-green-500/10';

  const basisMatchIcon = qubit.basisMatch 
    ? <span className="text-green-400 text-xl" title="Basis Match">✓</span> 
    : <span className="text-red-400 text-xl" title="Basis Mismatch">✗</span>;
  
  const keyMatchIcon = qubit.basisMatch && (qubit.keyMatch 
    ? <span className="text-green-400" title="Key Match">(✓)</span>
    : <span className="text-red-400" title="Key Mismatch">(✗)</span>);

  const isBB84 = protocol === 'BB84';

  const aliceContent = (
    <div className="flex items-center justify-center space-x-2" title={`Alice Bit: ${qubit.aliceBit}, Basis: ${qubit.aliceBasis}`}>
      <BitIcon bit={qubit.aliceBit} />
      {getBasisIcon(qubit.aliceBasis)}
    </div>
  );
  
  const channelContent = (
    <div className="flex items-center justify-center text-2xl h-8">
      {qubit.eveInterfered ? <EveIcon /> : qubit.channelError ? <NoiseIcon /> : <span className="text-gray-600">—</span>}
    </div>
  );
  
  const bobContent = (
    <div className="flex items-center justify-center space-x-2" title={`Bob Bit: ${qubit.bobBit}, Basis: ${qubit.bobBasis}`}>
      {getBasisIcon(qubit.bobBasis)}
      <BitIcon bit={qubit.bobBit} />
    </div>
  );
  
  const resultContent = (
    <div className="flex items-center justify-center text-lg space-x-2 font-mono">
      {basisMatchIcon}
      {keyMatchIcon}
    </div>
  );

  return (
    <>
      {/* Mobile Card View (hidden on md and up) */}
      <div className={`p-3 border-b border-brand-border md:hidden ${statusClass}`}>
        <div className="flex justify-between items-center mb-3">
          <span className="font-mono text-sm text-gray-400">#{qubit.id + 1}</span>
          <div className="flex items-center space-x-2">
            {!qubit.basisMatch ? <span className="text-red-400 text-sm font-bold">عدم تطابق</span> :
             qubit.keyMatch === false ? <span className="text-red-400 text-sm font-bold">خطا</span> :
             <span className="text-green-400 text-sm font-bold">موفق</span>}
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">{isBB84 ? 'آلیس (ارسال)' : 'آلیس (اندازه‌گیری)'}</span>
            {aliceContent}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">{isBB84 ? 'کانال / Eve' : 'منبع / Eve'}</span>
            {channelContent}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">{isBB84 ? 'باب (دریافت)' : 'باب (اندازه‌گیری)'}</span>
            {bobContent}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">نتیجه</span>
            {resultContent}
          </div>
        </div>
      </div>

      {/* Desktop Row View (hidden below md) */}
      <div className={`hidden md:flex items-center p-2 border-b border-brand-border ${statusClass}`}>
        <div className="w-1/12 text-center font-mono text-sm text-gray-500">{qubit.id + 1}</div>
        <div className="w-2/12">{aliceContent}</div>
        <div className="w-3/12">{channelContent}</div>
        <div className="w-3/12">{bobContent}</div>
        <div className="w-3/12">{resultContent}</div>
      </div>
    </>
  );
};


export const SimulationView: React.FC<{ result: SimulationResult | null, protocol: Protocol }> = ({ result, protocol }) => {
  if (!result) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] glassmorphic border-2 border-dashed border-brand-border rounded-2xl">
        <p className="text-gray-400 text-lg">برای مشاهده نتایج، شبیه‌سازی را شروع کنید.</p>
      </div>
    );
  }

  const isBB84 = protocol === 'BB84';
  const qubitsToShow = result.qubits.slice(0, 50); // Show first 50 for performance

  return (
    <div className="glassmorphic rounded-2xl shadow-lg max-h-[80vh] overflow-y-auto">
      <div className="sticky top-0 glassmorphic z-10 p-4 rounded-t-2xl">
        <div className="hidden md:flex items-center font-bold text-gray-300 text-sm border-b-2 border-brand-border pb-2">
          <div className="w-1/12 text-center">#</div>
          <div className="w-2/12 text-center">{isBB84 ? 'آلیس (ارسال)' : 'آلیس (اندازه‌گیری)'}</div>
          <div className="w-3/12 text-center">{isBB84 ? 'کانال / Eve' : 'منبع / Eve'}</div>
          <div className="w-3/12 text-center">{isBB84 ? 'باب (دریافت)' : 'باب (اندازه‌گیری)'}</div>
          <div className="w-3/12 text-center">نتیجه</div>
        </div>
      </div>
      <div>
        {qubitsToShow.map((qubit) => (
          <QubitLane key={qubit.id} qubit={qubit} protocol={protocol} />
        ))}
        {result.qubits.length > 50 && <p className="text-center text-sm text-gray-500 p-3">... و {result.qubits.length - 50} کیوبیت دیگر</p>}
      </div>
    </div>
  );
};