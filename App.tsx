import React, { useState, useCallback } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { SimulationView } from './components/SimulationView';
import { AnalysisPanel, SweepPoint } from './components/AnalysisPanel';
import { ResultsSummary } from './components/ResultsSummary';
import { EducationPage } from './components/EducationPage';
import { QuantumLabPage } from './components/QuantumLabPage';
import { analyzeSimulation } from './services/geminiService';
import { Basis, Bit } from './types';
import type { SimulationParams, SimulationResult, Qubit, LLMAnalysis, AggregatedSimulationResult } from './types';

const runBB84Simulation = (params: SimulationParams): SimulationResult => {
  const qubits: Qubit[] = [];
  for (let i = 0; i < params.qubitCount; i++) {
    const aliceBit = Math.random() < 0.5 ? Bit.Zero : Bit.One;
    const aliceBasis = Math.random() * 100 < params.rectilinearBasisPercent ? Basis.Rectilinear : Basis.Diagonal;
    
    let qubitState = { bit: aliceBit, basis: aliceBasis };

    const eveInterfered = Math.random() * 100 < params.eavesdropPercent;
    let eveBasis: Basis | undefined;
    let eveBit: Bit | undefined;

    if (eveInterfered) {
      eveBasis = Math.random() < 0.5 ? Basis.Rectilinear : Basis.Diagonal;
      if (qubitState.basis !== eveBasis) {
        qubitState.bit = Math.random() < 0.5 ? Bit.Zero : Bit.One;
      }
      eveBit = qubitState.bit;
      qubitState.basis = eveBasis;
    }
    
    const noiseEventHappened = Math.random() * 100 < params.qberPercent;
    const bobBasis = Math.random() < 0.5 ? Basis.Rectilinear : Basis.Diagonal;
    let bobBit: Bit;

    if (noiseEventHappened && params.noiseModel === 'Depolarizing') {
      bobBit = Math.random() < 0.5 ? Bit.Zero : Bit.One;
    } else {
      let bitBeforeBobMeasurement = qubitState.bit;
      if (noiseEventHappened && params.noiseModel === 'SimpleQBER') {
        bitBeforeBobMeasurement = bitBeforeBobMeasurement === Bit.Zero ? Bit.One : Bit.Zero;
      }

      if (qubitState.basis === bobBasis) {
        bobBit = bitBeforeBobMeasurement;
      } else {
        bobBit = Math.random() < 0.5 ? Bit.Zero : Bit.One;
      }
    }
    
    qubits.push({
      id: i,
      aliceBit,
      aliceBasis,
      eveInterfered,
      eveBasis,
      eveBit,
      channelError: noiseEventHappened,
      bobBasis,
      bobBit,
      basisMatch: aliceBasis === bobBasis,
    });
  }
  const siftedQubits = qubits.filter(q => q.basisMatch);
  const sampleSize = Math.ceil(siftedQubits.length * 0.5);
  const sampleQubits = siftedQubits.slice(0, sampleSize);
  const mismatchedBits = sampleQubits.filter(q => q.aliceBit !== q.bobBit).length;
  const measuredQBER = sampleSize > 0 ? mismatchedBits / sampleSize : 0;
  
  sampleQubits.forEach(q => { q.keyMatch = q.aliceBit === q.bobBit; });
  const remainingSiftedQubits = siftedQubits.slice(sampleSize);
  remainingSiftedQubits.forEach(q => { q.keyMatch = q.aliceBit === q.bobBit; });
  const finalKeyLength = Math.max(0, remainingSiftedQubits.length - Math.ceil(remainingSiftedQubits.length * measuredQBER));

  return { qubits, siftedKeyLength: siftedQubits.length, finalKeyLength, measuredQBER };
};

const runE91Simulation = (params: SimulationParams): SimulationResult => {
  const qubits: Qubit[] = [];
  for (let i = 0; i < params.qubitCount; i++) {
      const correlatedBit = Math.random() < 0.5 ? Bit.Zero : Bit.One;
      const aliceBasis = Math.random() * 100 < params.rectilinearBasisPercent ? Basis.Rectilinear : Basis.Diagonal;
      const bobBasis = Math.random() * 100 < params.rectilinearBasisPercent ? Basis.Rectilinear : Basis.Diagonal;
      const basisMatch = aliceBasis === bobBasis;

      let aliceMeasurementResult = correlatedBit;
      let bobMeasurementResult = correlatedBit;

      const eveInterfered = Math.random() * 100 < params.eavesdropPercent;
      if (eveInterfered) {
          aliceMeasurementResult = Math.random() < 0.5 ? Bit.Zero : Bit.One;
          bobMeasurementResult = Math.random() < 0.5 ? Bit.Zero : Bit.One;
      } else if (!basisMatch) {
          bobMeasurementResult = Math.random() < 0.5 ? Bit.Zero : Bit.One;
      }
      
      const noiseEventHappened = Math.random() * 100 < params.qberPercent;
      if (noiseEventHappened) {
        if (params.noiseModel === 'Depolarizing') {
          bobMeasurementResult = Math.random() < 0.5 ? Bit.Zero : Bit.One;
        } else { // SimpleQBER
          bobMeasurementResult = bobMeasurementResult === Bit.Zero ? Bit.One : Bit.Zero;
        }
      }
      
      qubits.push({
          id: i,
          aliceBit: aliceMeasurementResult,
          aliceBasis,
          eveInterfered,
          channelError: noiseEventHappened,
          bobBasis,
          bobBit: bobMeasurementResult,
          basisMatch,
      });
  }

  const siftedQubits = qubits.filter(q => q.basisMatch);
  const sampleSize = Math.ceil(siftedQubits.length * 0.5);
  const sampleQubits = siftedQubits.slice(0, sampleSize);
  const mismatchedBits = sampleQubits.filter(q => q.aliceBit !== q.bobBit).length;
  const measuredQBER = sampleSize > 0 ? mismatchedBits / sampleSize : 0;

  sampleQubits.forEach(q => { q.keyMatch = q.aliceBit === q.bobBit; });
  const remainingSiftedQubits = siftedQubits.slice(sampleSize);
  remainingSiftedQubits.forEach(q => { q.keyMatch = q.aliceBit === q.bobBit; });
  const finalKeyLength = Math.max(0, remainingSiftedQubits.length - Math.ceil(remainingSiftedQubits.length * measuredQBER));

  return { qubits, siftedKeyLength: siftedQubits.length, finalKeyLength, measuredQBER };
};

const Header: React.FC<{
  currentView: 'simulator' | 'education' | 'lab';
  setView: (view: 'simulator' | 'education' | 'lab') => void;
}> = ({ currentView, setView }) => (
  <header className="text-center mb-10">
    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-teal-400 pb-2">
      شبیه‌ساز توزیع کلید کوانتومی (QKD)
    </h1>
    <p className="mt-2 text-lg text-gray-400 max-w-3xl mx-auto">
      پروتکل‌های <strong className="font-semibold text-cyan-400">BB84</strong> و <strong className="font-semibold text-cyan-400">E91</strong> را با پارامترهای مختلف آزمایش کنید و تحلیل آن را با کمک هوش مصنوعی مشاهده نمایید.
    </p>
    <nav className="mt-8 flex justify-center gap-2 sm:gap-4 flex-wrap">
        <button
          onClick={() => setView('simulator')}
          className={`px-4 sm:px-6 py-2 text-base sm:text-lg font-semibold rounded-lg transition-all duration-300 ${
            currentView === 'simulator' 
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30' 
              : 'bg-brand-surface text-gray-400 hover:bg-brand-surface/80 hover:text-white'
          }`}
        >
          شبیه‌ساز
        </button>
        <button
          onClick={() => setView('lab')}
          className={`px-4 sm:px-6 py-2 text-base sm:text-lg font-semibold rounded-lg transition-all duration-300 ${
            currentView === 'lab' 
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30' 
              : 'bg-brand-surface text-gray-400 hover:bg-brand-surface/80 hover:text-white'
          }`}
        >
          آزمایشگاه کوانتومی
        </button>
        <button
          onClick={() => setView('education')}
          className={`px-4 sm:px-6 py-2 text-base sm:text-lg font-semibold rounded-lg transition-all duration-300 ${
            currentView === 'education' 
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30' 
              : 'bg-brand-surface text-gray-400 hover:bg-brand-surface/80 hover:text-white'
          }`}
        >
          مرکز آموزش
        </button>
      </nav>
  </header>
);

const App: React.FC = () => {
  const [view, setView] = useState<'simulator' | 'education' | 'lab'>('simulator');
  const [params, setParams] = useState<SimulationParams>({
    protocol: 'BB84',
    qubitCount: 200,
    runCount: 1,
    noiseModel: 'SimpleQBER',
    rectilinearBasisPercent: 50,
    eavesdropPercent: 20,
    qberPercent: 2,
  });
  const [aggregatedResult, setAggregatedResult] = useState<AggregatedSimulationResult | null>(null);
  const [analysis, setAnalysis] = useState<Pick<LLMAnalysis, 'textual' | 'mathematical'> | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [sweepResults, setSweepResults] = useState<SweepPoint[] | null>(null);
  const [isSweeping, setIsSweeping] = useState<boolean>(false);

  const handleStart = useCallback(async () => {
    setIsSimulating(true);
    setIsAnalyzing(true);
    setAggregatedResult(null);
    setAnalysis(null);
    setSweepResults(null);

    const runSimulation = params.protocol === 'BB84' ? runBB84Simulation : runE91Simulation;
    let totalSiftedKey = 0;
    let totalFinalKey = 0;
    let totalQBER = 0;
    let lastRunResult: SimulationResult | null = null;

    for (let i = 0; i < params.runCount; i++) {
        const result = runSimulation(params);
        totalSiftedKey += result.siftedKeyLength;
        totalFinalKey += result.finalKeyLength;
        totalQBER += result.measuredQBER;
        if (i === params.runCount - 1) {
            lastRunResult = result;
        }
    }

    if (!lastRunResult) {
      setIsSimulating(false);
      setIsAnalyzing(false);
      return;
    }

    const aggResult: AggregatedSimulationResult = {
      totalRuns: params.runCount,
      avgSiftedKeyLength: totalSiftedKey / params.runCount,
      avgFinalKeyLength: totalFinalKey / params.runCount,
      avgMeasuredQBER: totalQBER / params.runCount,
      finalKeyRate: (totalFinalKey / params.runCount) / params.qubitCount,
      lastRun: lastRunResult,
    };

    setAggregatedResult(aggResult);
    
    const llmAnalysis = await analyzeSimulation(params.protocol, params, lastRunResult);
    setAnalysis(llmAnalysis);
    
    setIsAnalyzing(false);
    setIsSimulating(false);
  }, [params]);

  const handleRetryAnalysis = useCallback(async () => {
    if (!params || !aggregatedResult?.lastRun) return;

    setIsAnalyzing(true);
    setAnalysis(null);

    const llmAnalysis = await analyzeSimulation(params.protocol, params, aggregatedResult.lastRun);
    setAnalysis(llmAnalysis);

    setIsAnalyzing(false);
  }, [params, aggregatedResult]);

  const handleStartSweep = useCallback(async () => {
    setIsSweeping(true);
    setSweepResults(null);
    
    const runSimulation = params.protocol === 'BB84' ? runBB84Simulation : runE91Simulation;
    const results: SweepPoint[] = [];
    const sweepParam = 'eavesdropPercent';
    
    // Sweep from 0% to 50% eavesdropping in steps of 5%
    for (let i = 0; i <= 50; i += 5) {
      const tempParams = { ...params, [sweepParam]: i, runCount: 1 }; // Use single run for each point
      const result = runSimulation(tempParams);
      const finalKeyRate = result.finalKeyLength / tempParams.qubitCount;
      results.push({ parameter: i, keyRate: finalKeyRate });
    }
    
    setSweepResults(results);
    setIsSweeping(false);
  }, [params]);

  const renderView = () => {
    switch(view) {
      case 'simulator':
        return (
            <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <aside className="lg:col-span-3">
                <ControlPanel params={params} setParams={setParams} onStart={handleStart} isLoading={isSimulating} />
              </aside>
              
              <div className="lg:col-span-9 space-y-8">
                {aggregatedResult && <ResultsSummary result={aggregatedResult} />}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <section>
                    <h2 className="text-2xl font-semibold mb-4 text-white">نمایش فرآیند شبیه‌سازی (آخرین اجرا)</h2>
                    <SimulationView result={aggregatedResult?.lastRun ?? null} protocol={params.protocol} />
                    </section>
                    
                    <section>
                    <h2 className="text-2xl font-semibold mb-4 text-white">تحلیل شبیه‌سازی</h2>
                    <AnalysisPanel 
                        analysis={analysis} 
                        isLoading={isSimulating}
                        isAnalyzing={isAnalyzing}
                        onRetryAnalysis={handleRetryAnalysis}
                        params={params} 
                        result={aggregatedResult?.lastRun ?? null}
                        sweepResults={sweepResults}
                        onStartSweep={handleStartSweep}
                        isSweeping={isSweeping}
                    />
                    </section>
                </div>
              </div>
            </main>
        );
      case 'education':
        return <EducationPage />;
      case 'lab':
        return <QuantumLabPage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-gray-300 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-screen-2xl mx-auto">
        <Header currentView={view} setView={setView} />
        {renderView()}
      </div>
    </div>
  );
};

export default App;