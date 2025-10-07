import React from 'react';
import { Basis, Protocol } from '../types';
import type { SimulationResult, Qubit } from '../types';
import { RectilinearIcon, DiagonalIcon, BitIcon, EveIcon, NoiseIcon } from './icons/BasisIcons';

const SimulationLegend: React.FC = () => {
  const legendItemClass = "flex items-center gap-2 text-xs text-gray-400";
  return (
    <div className="p-4 border-b border-brand-border">
      <h4 className="text-sm font-bold text-white mb-3">راهنمای آیکون‌ها</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-2">
        <div className={legendItemClass}>
          <RectilinearIcon /><span>مبنای Rectilinear</span>
        </div>
        <div className={legendItemClass}>
          <DiagonalIcon /><span>مبنای Diagonal</span>
        </div>
        <div className={legendItemClass}>
          <div className="flex items-center gap-1"><BitIcon bit={0} /> / <BitIcon bit={1} /></div><span>بیت ۰ / ۱</span>
        </div>
        <div className={legendItemClass}>
          <EveIcon /><span>استراق سمع Eve</span>
        </div>
        <div className={legendItemClass}>
          <NoiseIcon /><span>خطای کانال</span>
        </div>
        <div className={legendItemClass}>
          <span className="text-green-400 text-lg">✓</span><span>تطابق مبنا</span>
        </div>
        <div className={legendItemClass}>
          <span className="text-red-400 text-lg">✗</span><span>عدم تطابق مبنا</span>
        </div>
        <div className={legendItemClass}>
          <span className="text-green-400 text-sm">(✓)</span><span>کلید مطابق</span>
        </div>
        <div className={legendItemClass}>
          <span className="text-red-400 text-sm">(✗)</span><span>کلید نامطابق (خطا)</span>
        </div>
        <div className={legendItemClass}>
          <div className="w-4 h-4 bg-white/10 rounded-sm opacity-40"></div><span>کیوبیت حذف شده</span>
        </div>
      </div>
    </div>
  );
};

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
      <SimulationLegend />
      <div className="sticky top-0 glassmorphic z-10 p-4">
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