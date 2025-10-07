import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { LLMAnalysis, SimulationParams, SimulationResult, EducationalContent } from '../types';
import Loader from './Loader';

type Tab = 'tutorial' | 'textual' | 'mathematical' | 'charts';

const AnalysisTabs: React.FC<{ activeTab: Tab; setActiveTab: (tab: Tab) => void }> = ({ activeTab, setActiveTab }) => (
    <div className="flex border-b border-brand-border mb-4">
    {(['tutorial', 'textual', 'mathematical', 'charts'] as Tab[]).map((tab) => {
      const labels = {
        tutorial: 'آموزش گام به گام',
        textual: 'تحلیل متنی',
        mathematical: 'اثبات ریاضیاتی',
        charts: 'نمودارها'
      };
      return (
        <button
          key={tab}
          className={`px-4 py-3 text-sm sm:text-base font-semibold transition-colors duration-200 relative ${activeTab === tab ? 'text-brand-cyan' : 'text-gray-400 hover:text-white'}`}
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

const TutorialView: React.FC<{ content: EducationalContent }> = ({ content }) => (
    <div>
        <h2 className="text-2xl font-bold text-cyan-300 border-b border-brand-border pb-2 mb-4">پیش‌نیازهای کوانتومی</h2>
        <ReactMarkdown children={content.prerequisites} components={markdownComponents} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} />
        
        <h2 className="text-2xl font-bold text-cyan-300 border-b border-brand-border pb-2 mb-4 mt-8">مراحل پروتکل</h2>
        <ReactMarkdown children={content.protocolSteps} components={markdownComponents} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} />
        
        <h2 className="text-2xl font-bold text-cyan-300 border-b border-brand-border pb-2 mb-4 mt-8">تحلیل امنیتی به زبان ساده</h2>
        <ReactMarkdown children={content.securityAnalysis} components={markdownComponents} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} />
    </div>
);


const ChartsView: React.FC<{ params: SimulationParams; result: SimulationResult }> = ({ params, result }) => {
    const keyComparisonData = [
        { name: 'کلیدها', 'کیوبیت‌های ارسالی': params.qubitCount, 'کلید غربال شده': result.siftedKeyLength, 'کلید نهایی امن': result.finalKeyLength },
    ];

    const qberVsEavesdroppingData = [
        { eavesdropping: '0%', qber: params.qberPercent },
        { eavesdropping: `${params.eavesdropPercent}%`, qber: parseFloat((result.measuredQBER * 100).toFixed(2)) },
        { eavesdropping: '100%', qber: parseFloat((params.qberPercent + (100 - params.qberPercent) * 0.25).toFixed(2)) },
    ];
    
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-semibold mb-4 text-white">مقایسه طول کلید</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={keyComparisonData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="name" stroke="#A0AEC0" />
              <YAxis stroke="#A0AEC0" />
              <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid rgba(255, 255, 255, 0.1)' }} />
              <Legend />
              <Bar dataKey="کیوبیت‌های ارسالی" fill="#4299E1" />
              <Bar dataKey="کلید غربال شده" fill="#48BB78" />
              <Bar dataKey="کلید نهایی امن" fill="#22d3ee" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4 text-white">نرخ خطا (QBER) در برابر استراق سمع</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={qberVsEavesdroppingData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
               <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
               <XAxis dataKey="eavesdropping" stroke="#A0AEC0" />
               <YAxis domain={[0, 50]} stroke="#A0AEC0" unit="%" />
               <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid rgba(255, 255, 255, 0.1)' }} />
               <Legend />
               <Line type="monotone" dataKey="qber" name="QBER (%)" stroke="#ED8936" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
};


export const AnalysisPanel: React.FC<{ 
    analysis: LLMAnalysis | null; 
    isLoading: boolean; 
    isTutorialLoading: boolean; 
    params: SimulationParams | null; 
    result: SimulationResult | null;
    onFetchTutorial: () => void;
}> = ({ analysis, isLoading, isTutorialLoading, params, result, onFetchTutorial }) => {
  const [activeTab, setActiveTab] = useState<Tab>('tutorial');

  const renderContent = () => {
    if (activeTab === 'tutorial') {
      if (isTutorialLoading) return <Loader text="...در حال دریافت محتوای آموزشی" />;
      if (analysis?.educational) return <TutorialView content={analysis.educational} />;
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
            <h3 className="text-xl font-semibold text-white mb-4">آموزش گام به گام پروتکل</h3>
            <p className="text-gray-400 mb-6 max-w-md">
              با کلیک بر روی دکمه زیر، یک راهنمای کامل و ساده برای درک مفاهیم پایه‌ای و مراحل این پروتکل دریافت کنید.
            </p>
            <button
              onClick={onFetchTutorial}
              className="px-6 py-3 font-bold text-white transition-all duration-300 bg-cyan-600 rounded-lg shadow-lg hover:bg-cyan-500 hover:shadow-cyan-500/50 transform hover:scale-105"
            >
              دریافت آموزش
            </button>
          </div>
      );
    }

    if (isLoading) {
      return <Loader text="...در حال تحلیل نتایج با هوش مصنوعی" />;
    }

    if (!analysis || !params || !result) {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <p className="text-gray-400 text-lg text-center">
            {activeTab !== 'charts' 
              ? 'تحلیل پس از اجرای شبیه‌سازی نمایش داده می‌شود.'
              : 'نمودارها پس از اجرای شبیه‌سازی نمایش داده می‌شوند.'}
          </p>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'textual':
        return <ReactMarkdown children={analysis.textual} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={markdownComponents} />;
      case 'mathematical':
        return <ReactMarkdown children={analysis.mathematical} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={markdownComponents} />;
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