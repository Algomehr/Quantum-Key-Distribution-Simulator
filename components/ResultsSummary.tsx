import React from 'react';
import type { AggregatedSimulationResult } from '../types';

interface ResultsSummaryProps {
  result: AggregatedSimulationResult;
}

const StatCard: React.FC<{ label: string; value: string; subtext?: string; className?: string }> = ({ label, value, subtext, className }) => (
  <div className={`bg-brand-surface/50 p-4 rounded-lg text-center border border-brand-border transition-all duration-300 hover:bg-brand-surface/80 hover:border-cyan-400/50 ${className}`}>
    <p className="text-sm text-gray-400">{label}</p>
    <p className="text-2xl font-bold text-brand-cyan font-mono">{value}</p>
    {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
  </div>
);

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({ result }) => {

  const handleExport = () => {
    const qubits = result.lastRun.qubits;
    const header = [
        "ID", "Alice_Bit", "Alice_Basis", "Eve_Interfered", "Eve_Basis", "Eve_Bit", 
        "Channel_Error", "Bob_Basis", "Bob_Bit", "Basis_Match", "Key_Match"
    ].join(',');

    const rows = qubits.map(q => [
        q.id + 1,
        q.aliceBit,
        q.aliceBasis,
        q.eveInterfered,
        q.eveBasis ?? '',
        q.eveBit ?? '',
        q.channelError,
        q.bobBasis,
        q.bobBit,
        q.basisMatch,
        q.keyMatch ?? ''
    ].join(','));

    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `qkd_simulation_results_${new Date().toISOString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  return (
    <div className="glassmorphic p-6 rounded-2xl shadow-lg">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
        <h2 className="text-2xl font-semibold text-white text-center sm:text-left">خلاصه نتایج آماری</h2>
        <button
          onClick={handleExport}
          className="w-full sm:w-auto px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-500 transition-colors duration-200 text-sm flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          خروجی CSV
        </button>
      </div>
      {result.totalRuns > 1 && (
        <p className="text-sm text-gray-400 mb-4 text-center bg-brand-surface/50 py-2 px-4 rounded-md">
          نتایج زیر میانگین <strong className="font-mono text-cyan-400">{result.totalRuns}</strong> بار تکرار شبیه‌سازی است.
        </p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          label="میانگین طول کلید نهایی" 
          value={result.avgFinalKeyLength.toFixed(1)} 
          subtext="بیت امن"
        />
        <StatCard 
          label="نرخ کلید نهایی" 
          value={result.finalKeyRate.toFixed(4)}
          subtext="بیت امن / کیوبیت ارسالی"
        />
        <StatCard 
          label="میانگین QBER" 
          value={`${(result.avgMeasuredQBER * 100).toFixed(2)}%`}
          subtext="نرخ خطای اندازه‌گیری شده"
        />
        <StatCard 
          label="میانگین کلید غربال‌شده" 
          value={result.avgSiftedKeyLength.toFixed(1)}
          subtext="تطابق مبنا"
        />
      </div>
    </div>
  );
};