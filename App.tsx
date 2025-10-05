import React, { useState, useCallback, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { SimulationView } from './components/SimulationView';
import { AnalysisPanel } from './components/AnalysisPanel';
import { analyzeSimulation, getEducationalContent } from './services/geminiService';
import { Basis, Bit } from './types';
import type { SimulationParams, SimulationResult, Qubit, LLMAnalysis } from './types';

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
    
    const channelError = Math.random() * 100 < params.qberPercent;
    if (channelError) {
      qubitState.bit = qubitState.bit === Bit.Zero ? Bit.One : Bit.Zero;
    }

    const bobBasis = Math.random() < 0.5 ? Basis.Rectilinear : Basis.Diagonal;
    let bobBit = qubitState.bit;
    if (qubitState.basis !== bobBasis) {
      bobBit = Math.random() < 0.5 ? Bit.Zero : Bit.One;
    }
    
    qubits.push({
      id: i,
      aliceBit,
      aliceBasis,
      eveInterfered,
      eveBasis,
      eveBit,
      channelError,
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
          // Eve breaks entanglement. Results become uncorrelated.
          aliceMeasurementResult = Math.random() < 0.5 ? Bit.Zero : Bit.One;
          bobMeasurementResult = Math.random() < 0.5 ? Bit.Zero : Bit.One;
      } else if (!basisMatch) {
          // Without Eve, if bases mismatch, results are random (50% correlation)
          bobMeasurementResult = Math.random() < 0.5 ? Bit.Zero : Bit.One;
      }
      
      const channelError = Math.random() * 100 < params.qberPercent;
      if (channelError) {
          bobMeasurementResult = bobMeasurementResult === Bit.Zero ? Bit.One : Bit.Zero;
      }
      
      qubits.push({
          id: i,
          aliceBit: aliceMeasurementResult,
          aliceBasis,
          eveInterfered,
          channelError,
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


const App: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>({
    protocol: 'BB84',
    qubitCount: 100,
    rectilinearBasisPercent: 50,
    eavesdropPercent: 20,
    qberPercent: 2,
  });
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [analysis, setAnalysis] = useState<LLMAnalysis | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isTutorialLoading, setIsTutorialLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTutorial = async () => {
      setIsTutorialLoading(true);
      const content = await getEducationalContent(params.protocol);
      if (content) {
        setAnalysis(prev => ({
            ...prev,
            textual: prev?.textual || '',
            mathematical: prev?.mathematical || '',
            educational: content 
        }));
      }
      setIsTutorialLoading(false);
    };
    fetchTutorial();
  }, [params.protocol]);


  const handleStart = useCallback(async () => {
    setIsSimulating(true);
    
    const simulationResult = params.protocol === 'BB84' 
      ? runBB84Simulation(params)
      : runE91Simulation(params);
      
    setResult(simulationResult);
    
    const llmAnalysis = await analyzeSimulation(params.protocol, params, simulationResult);
    setAnalysis(prev => ({
        ...prev,
        textual: llmAnalysis.textual,
        mathematical: llmAnalysis.mathematical,
    }));
    
    setIsSimulating(false);
  }, [params]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-screen-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-cyan-300">
            شبیه‌ساز توزیع کلید کوانتومی (QKD)
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            پروتکل‌های BB84 و E91 را با پارامترهای مختلف آزمایش کنید و تحلیل آن را مشاهده نمایید.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3">
            <ControlPanel params={params} setParams={setParams} onStart={handleStart} isLoading={isSimulating} />
          </aside>
          
          <div className="lg:col-span-9 grid grid-cols-1 xl:grid-cols-2 gap-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">نمایش فرآیند شبیه‌سازی</h2>
              <SimulationView result={result} protocol={params.protocol} />
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">تحلیل و آموزش</h2>
              <AnalysisPanel 
                analysis={analysis} 
                isLoading={isSimulating} 
                isTutorialLoading={isTutorialLoading}
                params={params} 
                result={result} 
              />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;