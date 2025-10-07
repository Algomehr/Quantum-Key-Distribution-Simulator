import React from 'react';
import type { AggregatedSimulationResult, Qubit } from '../types';

interface ResultsSummaryProps {
  result: AggregatedSimulationResult;
}

const StatCard: React.FC<{ label: string; value: string; subtext?: string; className?: string }> = ({ label, value, subtext, className }) => (
  <div className={`bg-gray-700 p-4 rounded-lg text-center ${className}`}>
    <p className="text-sm text-gray-400">{label}</p>
    <p className="text-2xl font-bold text-cyan-300">{value}</p>
    {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
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
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-white">خلاصه نتایج آماری</h2>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          خروجی CSV (آخرین اجرا)
        </button>
      </div>
      {result.totalRuns > 1 && (
        <p className="text-sm text-gray-400 mb-4 text-center">
          نتایج زیر میانگین {result.totalRuns} بار تکرار شبیه‌سازی است.
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