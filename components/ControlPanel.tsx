import React from 'react';
import type { SimulationParams, Protocol } from '../types';

interface ControlPanelProps {
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
  onStart: () => void;
  isLoading: boolean;
}

const ProtocolSelector: React.FC<{
  selected: Protocol;
  onChange: (protocol: Protocol) => void;
}> = ({ selected, onChange }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-300">پروتکل</label>
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={() => onChange('BB84')}
        className={`px-3 py-2 text-sm font-bold rounded-md transition-colors ${selected === 'BB84' ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
      >
        BB84
      </button>
      <button
        onClick={() => onChange('E91')}
        className={`px-3 py-2 text-sm font-bold rounded-md transition-colors ${selected === 'E91' ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
      >
        E91 (Entanglement)
      </button>
    </div>
  </div>
);


const Slider = ({ label, value, onChange, min = 0, max = 100, unit = '%' }: { label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; min?: number; max?: number; unit?: string; }) => (
  <div className="space-y-2">
    <label className="flex justify-between text-sm font-medium text-gray-300">
      <span>{label}</span>
      <span className="font-mono text-cyan-300">{value}{unit}</span>
    </label>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={onChange}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-thumb-cyan"
      style={{
        '--thumb-color': '#22d3ee'
      } as React.CSSProperties}
    />
     <style>{`
        .range-thumb-cyan::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: var(--thumb-color);
          cursor: pointer;
          border-radius: 50%;
        }
        .range-thumb-cyan::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: var(--thumb-color);
          cursor: pointer;
          border-radius: 50%;
        }
      `}</style>
  </div>
);

export const ControlPanel: React.FC<ControlPanelProps> = ({ params, setParams, onStart, isLoading }) => {
  const handleParamChange = <K extends keyof SimulationParams,>(
    param: K,
    value: SimulationParams[K]
  ) => {
    setParams(prev => ({ ...prev, [param]: value }));
  };

  const basisLabel = params.protocol === 'BB84' 
    ? "درصد مبنای ارسال Rectilinear (+)"
    : "درصد مبنای اندازه‌گیری Rectilinear (+)";

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 space-y-6">
      <h2 className="text-2xl font-bold text-center text-white">پارامترهای شبیه‌سازی</h2>
      
      <ProtocolSelector 
        selected={params.protocol}
        onChange={(p) => handleParamChange('protocol', p)}
      />

      <Slider 
        label={basisLabel}
        value={params.rectilinearBasisPercent}
        onChange={(e) => handleParamChange('rectilinearBasisPercent', parseInt(e.target.value))}
      />
      <Slider 
        label="درصد استراق سمع (Eve)"
        value={params.eavesdropPercent}
        onChange={(e) => handleParamChange('eavesdropPercent', parseInt(e.target.value))}
      />
      <Slider 
        label="نرخ خطای کوانتومی کانال (QBER)"
        value={params.qberPercent}
        onChange={(e) => handleParamChange('qberPercent', parseInt(e.target.value))}
      />

      <button 
        onClick={onStart}
        disabled={isLoading}
        className="w-full px-4 py-3 font-bold text-white transition duration-300 bg-cyan-600 rounded-lg hover:bg-cyan-700 disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105"
      >
        {isLoading ? 'در حال تحلیل...' : 'شروع شبیه‌سازی و تحلیل'}
      </button>
    </div>
  );
};
