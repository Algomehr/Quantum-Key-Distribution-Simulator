import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { getQuantumSetupExplanation } from '../services/geminiService';
import type { Protocol, QuantumSetupExplanation, QuantumComponent } from '../types';
import Loader from './Loader';
import { QuantumSetupDiagram } from './QuantumSetupDiagram';

const markdownComponents = {
    h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-cyan-400 mt-6 mb-3" {...props} />,
    p: ({node, ...props}) => <p className="text-gray-300 leading-relaxed mb-4" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 mb-4 pr-4" {...props} />,
    strong: ({node, ...props}) => <strong className="font-bold text-cyan-300" {...props} />,
};

const ProtocolSelector: React.FC<{
  selected: Protocol;
  onChange: (protocol: Protocol) => void;
  disabled: boolean;
}> = ({ selected, onChange, disabled }) => (
  <div className="flex flex-col sm:flex-row bg-brand-surface p-1 rounded-lg border border-brand-border gap-1 max-w-sm mx-auto">
    <button
      onClick={() => onChange('BB84')}
      disabled={disabled}
      className={`w-full sm:w-1/2 px-3 py-2 text-sm font-bold rounded-md transition-all duration-300 ${selected === 'BB84' ? 'bg-cyan-600 text-white shadow-md' : 'text-gray-400 hover:bg-white/10'} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      BB84
    </button>
    <button
      onClick={() => onChange('E91')}
      disabled={disabled}
      className={`w-full sm:w-1/2 px-3 py-2 text-sm font-bold rounded-md transition-all duration-300 ${selected === 'E91' ? 'bg-cyan-600 text-white shadow-md' : 'text-gray-400 hover:bg-white/10'} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      E91 (Entanglement)
    </button>
  </div>
);

export const QuantumLabPage: React.FC = () => {
    const [protocol, setProtocol] = useState<Protocol>('BB84');
    const [explanation, setExplanation] = useState<QuantumSetupExplanation | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedComponent, setSelectedComponent] = useState<QuantumComponent | null>(null);

    const handleFetchExplanation = useCallback(async (proto: Protocol) => {
        setIsLoading(true);
        setSelectedComponent(null);
        const fetchedExplanation = await getQuantumSetupExplanation(proto);
        setExplanation(fetchedExplanation);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        handleFetchExplanation(protocol);
    }, [protocol, handleFetchExplanation]);
    
    const handleComponentClick = (componentId: string | null) => {
        if (!componentId) {
            setSelectedComponent(null);
            return;
        }
        const component = explanation?.components.find(c => c.id === componentId);
        setSelectedComponent(component || null);
    }

    return (
        <div className="max-w-7xl mx-auto py-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-4">آزمایشگاه کوانتومی</h2>
                <p className="text-gray-400 mb-6 max-w-3xl mx-auto">
                    نمایش بصری سخت‌افزار مورد استفاده در پروتکل‌های توزیع کلید کوانتومی را مشاهده کنید. برای دریافت اطلاعات بیشتر بر روی هر قطعه کلیک کنید.
                </p>
                <ProtocolSelector selected={protocol} onChange={setProtocol} disabled={isLoading} />
            </div>

            <div className="mt-8">
                {isLoading && <Loader text={`...در حال بارگذاری سخت‌افزار ${protocol}`} />}
                {explanation && !isLoading && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                       <div className="lg:col-span-8 glassmorphic p-4 sm:p-6 rounded-2xl shadow-lg">
                           <h3 className="text-2xl font-bold text-cyan-300 border-b border-brand-border pb-2 mb-4">{explanation.title}</h3>
                           <QuantumSetupDiagram 
                             protocol={protocol}
                             onComponentClick={handleComponentClick}
                             selectedComponentId={selectedComponent?.id || null}
                           />
                       </div>
                       <div className="lg:col-span-4 glassmorphic p-4 sm:p-6 rounded-2xl shadow-lg h-fit lg:sticky top-8">
                           {selectedComponent ? (
                                <div>
                                    <h4 className="text-xl font-bold text-cyan-300 mb-2">{selectedComponent.name}</h4>
                                    <p className="text-gray-300 leading-relaxed">{selectedComponent.description}</p>
                                    <button onClick={() => handleComponentClick(null)} className="text-sm text-cyan-400 hover:text-cyan-300 mt-4">بستن</button>
                                </div>
                           ) : (
                               <div>
                                   <h4 className="text-xl font-bold text-white mb-2">راهنما</h4>
                                   <p className="text-gray-400 leading-relaxed">بر روی یکی از اجزای دیاگرام در سمت چپ کلیک کنید تا توضیحات مربوط به آن را در اینجا مشاهده نمایید.</p>
                                   <div className="my-6 border-t border-brand-border"></div>
                                   <ReactMarkdown children={explanation.overview} components={markdownComponents} />
                               </div>
                           )}
                           <div className="my-6 border-t border-brand-border"></div>
                           <div className="max-h-[30vh] overflow-y-auto pr-2">
                                <ReactMarkdown children={explanation.process} components={markdownComponents} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} />
                           </div>
                       </div>
                    </div>
                )}
            </div>
        </div>
    )
}
