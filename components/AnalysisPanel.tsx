import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { LLMAnalysis, SimulationParams, SimulationResult } from '../types';
import Loader from './Loader';

export interface SweepPoint {
  parameter: number;
  keyRate: number;
}

type Tab = 'textual' | 'mathematical' | 'charts' | 'sweep';

const AnalysisTabs: React.FC<{ activeTab: Tab; setActiveTab: (tab: Tab) => void }> = ({ activeTab, setActiveTab }) => (
    <div className="flex border-b border-brand-border mb-4 overflow-x-auto">
    {(['textual', 'mathematical', 'charts', 'sweep'] as Tab[]).map((tab) => {
      const labels = {
        textual: 'تحلیل متنی',
        mathematical: 'اثبات ریاضیاتی',
        charts: 'نمودارها',
        sweep: 'نمودار پارامتری'
      };
      return (
        <button
          key={tab}
          className={`px-4 py-3 text-sm sm:text-base font-semibold transition-colors duration-200 relative whitespace-nowrap ${activeTab === tab ? 'text-brand-cyan' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab(tab)}
        >
          {labels[tab]}
          {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-cyan rounded-full"></div>}
        </button>
      );
    })}
  </div>
);


const markdownComponents = {
    h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-cyan-300 border-b border-brand-border pb-2 mb-4" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-cyan-400 mt-6 mb-3" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-white mt-4 mb-2" {...props} />,
    p: ({node, ...props}) => <p className="text-gray-300 leading-relaxed mb-4" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 mb-4 pr-4" {...props} />,
    ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-2 mb-4 pr-4" {...props} />,
    li: ({node, ...props}) => <li className="text-gray-300" {...props} />,
    strong: ({node, ...props}) => <strong className="font-bold text-cyan-300" {...props} />,
    code: ({node, inline, ...props}) => {
      if (inline) {
        return <code className="bg-brand-surface text-yellow-300 px-1.5 py-1 rounded text-sm font-mono" {...props} />;
      }
      return <pre className="bg-brand-dark p-4 rounded-lg overflow-x-auto border border-brand-border"><code className="text-sm font-mono" {...props} /></pre>;
    },
    blockquote: ({node, ...props}) => <blockquote className="border-r-4 border-cyan-500 pr-4 italic text-gray-400 my-4 bg-brand-surface/50 p-3 rounded-r-lg" {...props} />,
};

const QubitFunnel: React.FC<{ params: SimulationParams; result: SimulationResult }> = ({ params, result }) => {
    const total = params.qubitCount;
    const sifted = result.siftedKeyLength;
    const final = result.finalKeyLength;
    const basisMismatch = total - sifted;
    const errorAndPrivacy = sifted - final;

    const stages = [
        { label: 'کل کیوبیت‌های ارسالی', value: total, color: 'bg-blue-500' },
        { label: 'عدم تطابق مبنا (حذف شده)', value: basisMismatch, color: 'bg-red-500' },
        { label: 'کلید غربال شده', value: sifted, color: 'bg-yellow-500' },
        { label: 'خطا و تقویت حریم خصوصی', value: errorAndPrivacy, color: 'bg-orange-500' },
        { label: 'کلید نهایی امن', value: final, color: 'bg-green-500' },
    ];

    return (
        <div className="space-y-2">
            {stages.map((stage, index) => (
                <div key={index} className="flex items-center gap-4">
                    <div className="w-48 text-sm text-gray-300 text-right">{stage.label}</div>
                    <div className="flex-1 bg-brand-surface rounded-full h-6 p-0.5">
                        <div
                            className={`${stage.color} h-full rounded-full flex items-center justify-end pr-2`}
                            style={{ width: `${(stage.value / total) * 100}%` }}
                        >
                           <span className="text-xs font-bold text-white shadow-sm">{stage.value}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const ChartsView: React.FC<{ params: SimulationParams; result: SimulationResult }> = ({ params, result }) => {
    const keyComparisonData = [
        { name: 'کلیدها', 'کیوبیت‌های ارسالی': params.qubitCount, 'کلید غربال شده': result.siftedKeyLength, 'کلید نهایی امن': result.finalKeyLength },
    ];
    
    // Error source breakdown logic
    const errorQubits = result.qubits.filter(q => q.basisMatch && q.aliceBit !== q.bobBit);
    const errorsFromEve = errorQubits.filter(q => q.eveInterfered).length;
    const errorsFromNoise = errorQubits.length - errorsFromEve;
    const errorSourceData = [
        { name: 'خطای ناشی از استراق سمع (Eve)', value: errorsFromEve, color: '#F87171' },
        { name: 'خطای ناشی از نویز کانال', value: errorsFromNoise, color: '#FBBF24' },
    ];

    return (
      <div className="space-y-12">
        <div>
            <h3 className="text-xl font-semibold mb-4 text-white">سرنوشت کیوبیت‌ها در فرآیند غربال‌سازی</h3>
            <QubitFunnel params={params} result={result} />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4 text-white">مقایسه طول کلید</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={keyComparisonData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="name" stroke="#A0AEC0" />
              <YAxis stroke="#A0AEC0" />
              <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid rgba(255, 255, 0.1)' }} />
              <Legend />
              <Bar dataKey="کیوبیت‌های ارسالی" fill="#4299E1" />
              <Bar dataKey="کلید غربال شده" fill="#48BB78" />
              <Bar dataKey="کلید نهایی امن" fill="#22d3ee" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {errorQubits.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">تفکیک منابع خطا (QBER)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={errorSourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {errorSourceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid rgba(255, 255, 0.1)' }}/>
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
};

const SweepView: React.FC<{ results: SweepPoint[] | null, onStart: () => void, isLoading: boolean }> = ({ results, onStart, isLoading }) => {
    if (isLoading) {
      return <Loader text="...در حال اجرای تحلیل پارامتری" />;
    }
  
    if (!results || results.length === 0) {
      return (
        <div className="text-center p-4">
          <h3 className="text-xl font-semibold text-white mb-2">تحلیل پارامتری</h3>
          <p className="text-gray-400 mb-6">
            تاثیر تغییر یک پارامتر (مانند استراق سمع) بر روی نرخ کلید نهایی را مشاهده کنید. این تحلیل به شما کمک می‌کند تا مقاومت پروتکل را در شرایط مختلف بسنجید.
          </p>
          <button 
            onClick={onStart}
            disabled={isLoading}
            className="px-6 py-2 font-bold text-white transition-all duration-300 bg-teal-600 rounded-lg shadow-lg hover:bg-teal-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            شروع تحلیل پارامتری
          </button>
        </div>
      );
    }
  
    return (
      <div>
        <h3 className="text-xl font-semibold mb-4 text-white">نرخ کلید نهایی در برابر درصد استراق سمع</h3>
         <ResponsiveContainer width="100%" height={300}>
            <LineChart data={results} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
               <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
               <XAxis dataKey="parameter" type="number" stroke="#A0AEC0" unit="%" name="درصد استراق سمع" />
               <YAxis dataKey="keyRate" stroke="#A0AEC0" name="نرخ کلید نهایی" />
               <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid rgba(255, 255, 255, 0.1)' }} />
               <Legend />
               <Line type="monotone" dataKey="keyRate" name="نرخ کلید نهایی (بیت/کیوبیت)" stroke="#22d3ee" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
            </LineChart>
          </ResponsiveContainer>
      </div>
    );
  };


export const AnalysisPanel: React.FC<{ 
    analysis: Pick<LLMAnalysis, 'textual' | 'mathematical'> | null; 
    isLoading: boolean;
    isAnalyzing: boolean;
    params: SimulationParams | null; 
    result: SimulationResult | null;
    sweepResults: SweepPoint[] | null;
    onStartSweep: () => void;
    isSweeping: boolean;
    onRetryAnalysis: () => void;
}> = ({ analysis, isLoading, isAnalyzing, params, result, sweepResults, onStartSweep, isSweeping, onRetryAnalysis }) => {
  const [activeTab, setActiveTab] = useState<Tab>('textual');

  const renderContent = () => {
    if (isLoading) {
      return <Loader text="...در حال شبیه‌سازی و تحلیل" />;
    }
    if (isAnalyzing) {
      return <Loader text="...در حال دریافت تحلیل با هوش مصنوعی" />;
    }

    if (activeTab === 'sweep') {
      return <SweepView results={sweepResults} onStart={onStartSweep} isLoading={isSweeping} />;
    }

    if (!result || !params) {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <p className="text-gray-400 text-lg text-center">
            {activeTab !== 'charts' 
              ? 'تحلیل پس از اجرای شبیه‌سازی نمایش داده می‌شود.'
              // For sweep, this state is handled inside SweepView
              : activeTab !== 'sweep' ? 'نمودارها پس از اجرای شبیه‌سازی نمایش داده می‌شوند.' : ''}
          </p>
        </div>
      );
    }
    
    const analysisFailed = !analysis || (analysis.textual.includes("خطا در برقراری ارتباط"));

    if (analysisFailed && (activeTab === 'textual' || activeTab === 'mathematical')) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">خطا در تحلیل</h3>
          <p className="text-gray-400 mb-6 max-w-sm">
            {analysis?.textual || "متاسفانه در دریافت تحلیل از سرویس هوش مصنوعی مشکلی پیش آمد."}
          </p>
          <button
            onClick={onRetryAnalysis}
            disabled={isAnalyzing}
            className="w-full sm:w-auto px-6 py-2 font-bold text-white transition-all duration-300 bg-cyan-600 rounded-lg shadow-lg hover:bg-cyan-500 disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            <span>{isAnalyzing ? 'در حال تلاش...' : 'تلاش مجدد'}</span>
          </button>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'textual':
        return analysis ? <ReactMarkdown children={analysis.textual} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={markdownComponents} /> : null;
      case 'mathematical':
        return analysis ? <ReactMarkdown children={analysis.mathematical} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={markdownComponents} /> : null;
      case 'charts':
        return <ChartsView params={params} result={result} />;
      default:
        return null;
    }
  };

  return (
    <div className="glassmorphic p-4 sm:p-6 rounded-2xl shadow-lg h-full">
      <AnalysisTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="overflow-y-auto max-h-[70vh] p-2 -mr-2 pr-4">
        {renderContent()}
      </div>
    </div>
  );
};