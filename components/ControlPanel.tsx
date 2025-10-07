import React from 'react';
import type { SimulationParams, Protocol, NoiseModel } from '../types';

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
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">پروتکل</label>
    <div className="flex flex-col sm:flex-row bg-brand-surface p-1 rounded-lg border border-brand-border gap-1">
      <button
        onClick={() => onChange('BB84')}
        className={`w-full sm:w-1/2 px-3 py-2 text-sm font-bold rounded-md transition-all duration-300 ${selected === 'BB84' ? 'bg-cyan-600 text-white shadow-md' : 'text-gray-400 hover:bg-white/10'}`}
      >
        BB84
      </button>
      <button
        onClick={() => onChange('E91')}
        className={`w-full sm:w-1/2 px-3 py-2 text-sm font-bold rounded-md transition-all duration-300 ${selected === 'E91' ? 'bg-cyan-600 text-white shadow-md' : 'text-gray-400 hover:bg-white/10'}`}
      >
        E91 (Entanglement)
      </button>
    </div>
  </div>
);

const NoiseModelSelector: React.FC<{
  selected: NoiseModel;
  onChange: (model: NoiseModel) => void;
}> = ({ selected, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">مدل نویز کانال</label>
    <div className="flex flex-col sm:flex-row bg-brand-surface p-1 rounded-lg border border-brand-border gap-1">
      <button
        onClick={() => onChange('SimpleQBER')}
        className={`w-full sm:w-1/2 px-3 py-2 text-sm rounded-md transition-all duration-300 ${selected === 'SimpleQBER' ? 'bg-cyan-600 text-white shadow-md' : 'text-gray-400 hover:bg-white/10'}`}
      >
        خطای ساده (Bit-Flip)
      </button>
      <button
        onClick={() => onChange('Depolarizing')}
        className={`w-full sm:w-1/2 px-3 py-2 text-sm rounded-md transition-all duration-300 ${selected === 'Depolarizing' ? 'bg-cyan-600 text-white shadow-md' : 'text-gray-400 hover:bg-white/10'}`}
      >
        کانال دپلاریزه
      </button>
    </div>
  </div>
);


const Slider = ({ label, value, onChange, min = 0, max = 100, step = 1, unit = '' }: { label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; min?: number; max?: number; step?: number; unit?: string; }) => (
  <div className="space-y-2">
    <label className="flex justify-between text-sm font-medium text-gray-300">
      <span>{label}</span>
      <span className="font-mono text-brand-cyan">{value.toLocaleString()}{unit}</span>
    </label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="w-full h-2 bg-brand-surface rounded-lg appearance-none cursor-pointer range-thumb-cyan"
    />
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
    
  const startButtonText = params.runCount > 1
    ? `شروع ${params.runCount} شبیه‌سازی`
    : 'شروع شبیه‌سازی و تحلیل';
    
  const noiseLabel = params.noiseModel === 'Depolarizing'
    ? "احتمال دپلاریزه شدن"
    : "نرخ خطای کوانتومی کانال (QBER)";

  return (
    <div className="glassmorphic p-6 rounded-2xl shadow-lg space-y-6 lg:sticky top-8">
      <h2 className="text-2xl font-bold text-center text-white">پارامترهای شبیه‌سازی</h2>
      
      <div className="space-y-4">
        <ProtocolSelector 
          selected={params.protocol}
          onChange={(p) => handleParamChange('protocol', p)}
        />

        <NoiseModelSelector
          selected={params.noiseModel}
          onChange={(m) => handleParamChange('noiseModel', m)}
        />
        
        <Slider 
          label="تعداد کیوبیت‌ها / جفت‌ها"
          value={params.qubitCount}
          min={50}
          max={5000}
          step={50}
          onChange={(e) => handleParamChange('qubitCount', parseInt(e.target.value))}
        />
        <Slider 
          label="تعداد تکرار شبیه‌سازی"
          value={params.runCount}
          min={1}
          max={100}
          onChange={(e) => handleParamChange('runCount', parseInt(e.target.value))}
        />

        <Slider 
          label={basisLabel}
          value={params.rectilinearBasisPercent}
          unit="%"
          onChange={(e) => handleParamChange('rectilinearBasisPercent', parseInt(e.target.value))}
        />
        <Slider 
          label="درصد استراق سمع (Eve)"
          value={params.eavesdropPercent}
          unit="%"
          onChange={(e) => handleParamChange('eavesdropPercent', parseInt(e.target.value))}
        />
        <Slider 
          label={noiseLabel}
          value={params.qberPercent}
          unit="%"
          max={params.noiseModel === 'Depolarizing' ? 50 : 100}
          onChange={(e) => handleParamChange('qberPercent', parseInt(e.target.value))}
        />
      </div>

      <button 
        onClick={onStart}
        disabled={isLoading}
        className="w-full px-4 py-3 font-bold text-white transition-all duration-300 bg-cyan-600 rounded-lg shadow-lg hover:bg-cyan-500 hover:shadow-cyan-500/50 disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed transform hover:scale-105"
      >
        {isLoading ? 'در حال تحلیل...' : startButtonText}
      </button>
    </div>
  );
};