import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { getEducationalContent } from '../services/geminiService';
import type { Protocol, EducationalContent } from '../types';
import Loader from './Loader';

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

const TutorialView: React.FC<{ content: EducationalContent }> = ({ content }) => (
    <div className="glassmorphic p-6 sm:p-8 rounded-2xl shadow-lg mt-8">
        <ReactMarkdown children={content.prerequisites} components={markdownComponents} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} />
        <div className="my-8 border-t border-brand-border"></div>
        <ReactMarkdown children={content.protocolSteps} components={markdownComponents} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} />
        <div className="my-8 border-t border-brand-border"></div>
        <ReactMarkdown children={content.securityAnalysis} components={markdownComponents} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} />
    </div>
);

export const EducationPage: React.FC = () => {
    const [protocol, setProtocol] = useState<Protocol>('BB84');
    const [content, setContent] = useState<EducationalContent | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleFetchContent = useCallback(async () => {
        setIsLoading(true);
        setContent(null);
        const fetchedContent = await getEducationalContent(protocol);
        setContent(fetchedContent);
        setIsLoading(false);
    }, [protocol]);

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-4">مرکز آموزش کوانتوم</h2>
                <p className="text-gray-400 mb-6">
                    پروتکل مورد نظر خود را انتخاب کرده و یک راهنمای کامل و ساده برای درک مفاهیم پایه‌ای و مراحل آن دریافت کنید.
                </p>
                <div className="space-y-4">
                     <ProtocolSelector selected={protocol} onChange={setProtocol} disabled={isLoading} />
                     <button
                        onClick={handleFetchContent}
                        disabled={isLoading}
                        className="px-8 py-3 font-bold text-white transition-all duration-300 bg-cyan-600 rounded-lg shadow-lg hover:bg-cyan-500 hover:shadow-cyan-500/50 disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed transform hover:scale-105"
                        >
                        {isLoading ? 'در حال دریافت...' : `دریافت آموزش پروتکل ${protocol}`}
                    </button>
                </div>
            </div>

            <div className="mt-8">
                {isLoading && <Loader text="...در حال دریافت محتوای آموزشی" />}
                {content && <TutorialView content={content} />}
            </div>
        </div>
    )
}
