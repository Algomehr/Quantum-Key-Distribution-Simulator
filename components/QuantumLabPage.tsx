import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { getQuantumSetupExplanation } from '../services/geminiService';
import type { Protocol, QuantumSetupExplanation, QuantumComponent, PlacedComponent, Connection, Port, ComponentConfig, SimulationState, SimulationLog, ConfigurableProperty } from '../types';
import Loader from './Loader';
import { LaserIcon, PolarizerIcon, DetectorIcon, EntangledSourceIcon, BeamSplitterIcon, DefaultComponentIcon } from './icons/QuantumComponentIcons';

const markdownComponents = {
    h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-cyan-400 mt-6 mb-3" {...props} />,
    p: ({node, ...props}) => <p className="text-gray-300 leading-relaxed mb-4" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 mb-4 pr-4" {...props} />,
    strong: ({node, ...props}) => <strong className="font-bold text-cyan-300" {...props} />,
};

// --- SUB-COMPONENTS ---

const ProtocolSelector: React.FC<{
  selected: Protocol;
  onChange: (protocol: Protocol) => void;
  disabled: boolean;
}> = ({ selected, onChange, disabled }) => (
  <div className="flex bg-brand-surface p-1 rounded-lg border border-brand-border gap-1">
    <button
      onClick={() => onChange('BB84')}
      disabled={disabled}
      className={`w-full px-3 py-2 text-sm font-bold rounded-md transition-all duration-300 ${selected === 'BB84' ? 'bg-cyan-600 text-white shadow-md' : 'text-gray-400 hover:bg-white/10'} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      BB84
    </button>
    <button
      onClick={() => onChange('E91')}
      disabled={disabled}
      className={`w-full px-3 py-2 text-sm font-bold rounded-md transition-all duration-300 ${selected === 'E91' ? 'bg-cyan-600 text-white shadow-md' : 'text-gray-400 hover:bg-white/10'} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      E91
    </button>
  </div>
);

const ComponentPalette: React.FC<{ components: QuantumComponent[] }> = ({ components }) => {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, componentId: string) => {
        e.dataTransfer.setData('componentId', componentId);
    };

    return (
        <div className="glassmorphic p-4 rounded-2xl shadow-lg h-full overflow-y-auto">
            <h3 className="text-lg font-bold text-cyan-300 border-b border-brand-border pb-2 mb-4">پالت قطعات</h3>
            <div className="space-y-2">
                {components.map(component => (
                    <div 
                        key={component.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, component.id)}
                        className="bg-brand-surface p-3 rounded-lg border border-brand-border cursor-grab active:cursor-grabbing hover:bg-brand-surface/80 hover:border-cyan-500/50 transition-all duration-200 flex items-center gap-3"
                    >
                        <div className="w-8 h-8 flex-shrink-0"><ComponentIcon componentId={component.id} /></div>
                        <p className="font-semibold text-white text-sm">{component.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ComponentIcon = ({ componentId, config }: { componentId: string, config?: ComponentConfig }) => {
    const powerOn = config?.power === 'on';
    const iconProps = { className: `w-full h-full transition-all duration-300 ${powerOn ? 'text-cyan-300 animate-subtleGlow' : 'text-gray-500'}` };
    
    if (componentId.includes('laser')) return <LaserIcon {...iconProps} />;
    if (componentId.includes('polarizer')) return <PolarizerIcon {...iconProps} basis={config?.basis as string || '+'} />;
    if (componentId.includes('detector')) return <DetectorIcon {...iconProps} />;
    if (componentId.includes('entangled-source')) return <EntangledSourceIcon {...iconProps} />;
    if (componentId.includes('beam-splitter')) return <BeamSplitterIcon {...iconProps} />;
    
    return <DefaultComponentIcon {...iconProps} />;
};

const DraggableComponent: React.FC<{
    pc: PlacedComponent;
    isSelected: boolean;
    onSelect: (instanceId: string) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, pc: PlacedComponent) => void;
    onPortClick: (instanceId: string, portId: string) => void;
}> = ({ pc, isSelected, onSelect, onDragStart, onPortClick }) => {
    
    const renderPorts = (ports: Port[], side: 'left' | 'right') => (
        <div className={`absolute ${side === 'left' ? '-left-2.5' : '-right-2.5'} top-1/2 -translate-y-1/2 flex flex-col justify-around h-full py-2`}>
            {ports.map((port, index) => (
                <div
                    key={port.id}
                    title={`${port.name} (${port.type})`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onPortClick(pc.instanceId, port.id);
                    }}
                    className="w-4 h-4 bg-gray-400 rounded-full cursor-crosshair border-2 border-brand-surface hover:bg-cyan-400 hover:scale-125 transition-all duration-200"
                    style={{ zIndex: 1 }}
                />
            ))}
        </div>
    );

    const inputs = pc.component.ports.filter(p => p.type === 'input');
    const outputs = pc.component.ports.filter(p => p.type === 'output');

    return (
         <div
            draggable
            onDragStart={(e) => onDragStart(e, pc)}
            onClick={(e) => { e.stopPropagation(); onSelect(pc.instanceId); }}
            style={{ left: pc.x, top: pc.y }}
            className={`absolute p-2 w-48 h-20 flex flex-col items-center justify-center bg-brand-surface/70 rounded-lg cursor-move border-2 transition-all duration-200 ${isSelected ? 'border-cyan-400 shadow-lg shadow-cyan-500/30' : 'border-brand-border'}`}
        >
            {renderPorts(inputs, 'left')}
            <div className="w-10 h-10 mb-1"><ComponentIcon componentId={pc.component.id} config={pc.config} /></div>
            <p className="text-white text-center text-xs font-medium select-none truncate w-full">{pc.component.name}</p>
            {renderPorts(outputs, 'right')}
        </div>
    );
};

const Workbench: React.FC<{ 
    placedComponents: PlacedComponent[];
    connections: Connection[];
    wiringState: any;
    previewLine: { x1: number; y1: number; x2: number; y2: number; } | null;
    onDrop: (componentId: string, x: number, y: number) => void;
    onComponentMove: (instanceId: string, x: number, y: number) => void;
    onSelectComponent: (instanceId: string | null) => void;
    selectedComponentInstanceId: string | null;
    onPortClick: (instanceId: string, portId: string) => void;
    onWiringCancel: () => void;
    onWorkbenchMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
}> = ({ 
    placedComponents, connections, wiringState, previewLine,
    onDrop, onComponentMove, onSelectComponent, selectedComponentInstanceId,
    onPortClick, onWiringCancel, onWorkbenchMouseMove
}) => {
    const workbenchRef = useRef<HTMLDivElement>(null);
    const draggedComponentRef = useRef<{ instanceId: string, offsetX: number, offsetY: number } | null>(null);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const componentId = e.dataTransfer.getData('componentId');
        const instanceId = e.dataTransfer.getData('instanceId');

        if (workbenchRef.current) {
            const rect = workbenchRef.current.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;

            if (instanceId && draggedComponentRef.current) {
                x -= draggedComponentRef.current.offsetX;
                y -= draggedComponentRef.current.offsetY;
                onComponentMove(instanceId, x, y);
            } else if (componentId) {
                onDrop(componentId, x - 96, y - 40); // Adjust for component size (w-48, h-20)
            }
        }
        draggedComponentRef.current = null;
    };

    const handleComponentDragStart = (e: React.DragEvent<HTMLDivElement>, pc: PlacedComponent) => {
        e.dataTransfer.setData('instanceId', pc.instanceId);
        const rect = e.currentTarget.getBoundingClientRect();
        draggedComponentRef.current = {
            instanceId: pc.instanceId,
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top
        };
    };
    
    const getPortPosition = useCallback((instanceId: string, portId: string) => {
        const component = placedComponents.find(pc => pc.instanceId === instanceId);
        if (!component) return { x: 0, y: 0 };
        const port = component.component.ports.find(p => p.id === portId);
        if (!port) return { x: 0, y: 0 };
        
        const isInput = port.type === 'input';
        const portCount = component.component.ports.filter(p => p.type === port.type).length;
        const portIndex = component.component.ports.filter(p => p.type === port.type).findIndex(p => p.id === portId);
        
        const x = component.x + (isInput ? 0 : 192); // w-48 is 192px
        const y = component.y + (80 / (portCount + 1)) * (portIndex + 1); // h-20 is 80px
        
        return { x, y };
    }, [placedComponents]);

    return (
        <div 
            ref={workbenchRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={(e) => {
                if (e.target === workbenchRef.current) {
                    onSelectComponent(null);
                    if (wiringState) onWiringCancel();
                }
            }}
            onMouseMove={onWorkbenchMouseMove}
            className="glassmorphic rounded-2xl shadow-lg h-full w-full relative overflow-hidden bg-brand-dark/30"
        >
             <div className="absolute inset-0 bg-[radial-gradient(#38bdf822_1px,transparent_1px)] [background-size:20px_20px]"></div>
             <svg className="absolute top-0 left-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#22d3ee" />
                    </marker>
                </defs>
                {connections.map(conn => {
                    const fromPos = getPortPosition(conn.from.instanceId, conn.from.portId);
                    const toPos = getPortPosition(conn.to.instanceId, conn.to.portId);
                    return (
                        <path 
                            key={conn.id} 
                            d={`M ${fromPos.x} ${fromPos.y} C ${fromPos.x + 50} ${fromPos.y}, ${toPos.x - 50} ${toPos.y}, ${toPos.x} ${toPos.y}`}
                            stroke="#22d3ee" strokeWidth="2" fill="none"
                            style={{ filter: 'drop-shadow(0 0 3px #22d3ee)' }}
                        />
                    );
                })}
                {previewLine && (
                     <line 
                        x1={previewLine.x1} y1={previewLine.y1} 
                        x2={previewLine.x2} y2={previewLine.y2} 
                        stroke="#22d3ee" strokeWidth="2" strokeDasharray="5 5"
                    />
                )}
             </svg>

            {placedComponents.map(pc => (
                <DraggableComponent 
                    key={pc.instanceId}
                    pc={pc}
                    isSelected={selectedComponentInstanceId === pc.instanceId}
                    onSelect={onSelectComponent}
                    onDragStart={handleComponentDragStart}
                    onPortClick={onPortClick}
                />
            ))}
        </div>
    );
};

const PropertiesPanel: React.FC<{
    component: PlacedComponent;
    onConfigChange: (instanceId: string, newConfig: ComponentConfig) => void;
}> = ({ component, onConfigChange }) => {

    const handleChange = (id: string, value: any) => {
        const newConfig = { ...component.config, [id]: value };
        onConfigChange(component.instanceId, newConfig);
    };

    return (
        <div>
            <h3 className="text-xl font-bold text-cyan-300 mb-1">{component.component.name}</h3>
            <p className="text-sm text-gray-400 mb-4">{component.component.description}</p>
            <div className="border-t border-brand-border my-4"></div>
            <h4 className="text-lg font-semibold text-white mb-3">پیکربندی</h4>
            <div className="space-y-4">
                {component.component.configurableProperties?.map(prop => (
                    <div key={prop.id}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{prop.label}</label>
                        {prop.type === 'toggle' && (
                             <button
                                onClick={() => handleChange(prop.id, component.config[prop.id] === 'on' ? 'off' : 'on')}
                                className={`w-full p-2 rounded-lg font-bold text-sm transition-all duration-300 ${component.config[prop.id] === 'on' ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'}`}
                            >
                                {component.config[prop.id] === 'on' ? 'روشن' : 'خاموش'}
                            </button>
                        )}
                        {prop.type === 'select' && (
                            <div className="flex bg-brand-dark p-1 rounded-lg border border-brand-border gap-1">
                                {prop.options?.map(option => (
                                    <button
                                        key={option}
                                        onClick={() => handleChange(prop.id, option)}
                                        className={`w-full px-3 py-2 text-sm font-bold rounded-md transition-all duration-300 ${component.config[prop.id] === option ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:bg-white/10'}`}
                                    >
                                        {option === '+' ? 'Rectilinear (+)' : 'Diagonal (x)'}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                {!component.component.configurableProperties?.length && <p className="text-sm text-gray-500">این قطعه پارامتر قابل تنظیمی ندارد.</p>}
            </div>
        </div>
    )
}

const InfoPanel: React.FC<{
    explanation: QuantumSetupExplanation | null;
    selectedComponent: PlacedComponent | null;
    logs: SimulationLog[];
    onConfigChange: (instanceId: string, newConfig: ComponentConfig) => void;
}> = ({ explanation, selectedComponent, logs, onConfigChange }) => (
    <div className="glassmorphic p-4 sm:p-6 rounded-2xl shadow-lg h-full flex flex-col overflow-hidden">
        {selectedComponent ? (
            <PropertiesPanel component={selectedComponent} onConfigChange={onConfigChange} />
        ) : (
            <>
                <div className="flex-shrink-0">
                    <h3 className="text-xl font-bold text-white mb-2">راهنما و گزارش</h3>
                    <p className="text-gray-400 leading-relaxed text-sm">
                        برای مشاهده و تغییر تنظیمات، روی یک قطعه کلیک کنید. برای شروع، دکمه "شروع" را بزنید.
                    </p>
                    <div className="my-4 border-t border-brand-border"></div>
                </div>
                <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                    <h4 className="text-lg font-semibold text-cyan-400 mb-3 sticky top-0 bg-brand-surface/80 backdrop-blur-sm py-1">گزارش رویدادها</h4>
                     <div className="space-y-2 text-sm font-mono">
                        {logs.map(log => (
                            <p key={log.id} className={` ${log.type === 'success' ? 'text-green-400' : log.type === 'error' ? 'text-red-400' : 'text-gray-400'}`}>
                                <span className="text-gray-600 mr-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                {log.message}
                            </p>
                        ))}
                         {logs.length === 0 && <p className="text-gray-500 italic">شبیه‌سازی را برای دیدن رویدادها شروع کنید...</p>}
                    </div>
                </div>
            </>
        )}
    </div>
);

// --- MAIN PAGE COMPONENT ---

export const QuantumLabPage: React.FC = () => {
    const [protocol, setProtocol] = useState<Protocol>('BB84');
    const [explanation, setExplanation] = useState<QuantumSetupExplanation | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [placedComponents, setPlacedComponents] = useState<PlacedComponent[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [selectedComponentInstanceId, setSelectedComponentInstanceId] = useState<string | null>(null);
    const [wiringState, setWiringState] = useState<{ from: { instanceId: string; portId: string; }, fromPortType: 'input' | 'output' } | null>(null);
    const [previewLine, setPreviewLine] = useState<{x1: number, y1: number, x2: number, y2: number} | null>(null);
    const [simulationState, setSimulationState] = useState<SimulationState>('stopped');
    const [logs, setLogs] = useState<SimulationLog[]>([]);

    const addLog = (message: string, type: SimulationLog['type'] = 'info') => {
        setLogs(prev => [...prev.slice(-100), { id: Date.now(), timestamp: Date.now(), message, type }]);
    };

    const handleFetchExplanation = useCallback(async (proto: Protocol) => {
        setIsLoading(true);
        resetWorkbench();
        const fetchedExplanation = await getQuantumSetupExplanation(proto);
        setExplanation(fetchedExplanation);
        setIsLoading(false);
        addLog(`آزمایشگاه برای پروتکل ${proto} بارگذاری شد.`);
    }, []);

    useEffect(() => {
        handleFetchExplanation(protocol);
    }, [protocol, handleFetchExplanation]);
    
    const resetWorkbench = () => {
        setPlacedComponents([]);
        setConnections([]);
        setSelectedComponentInstanceId(null);
        setWiringState(null);
        setSimulationState('stopped');
        setLogs([]);
    };

    const handleDrop = (componentId: string, x: number, y: number) => {
        const component = explanation?.components.find(c => c.id === componentId);
        if (component) {
            const defaultConfig: ComponentConfig = {};
            component.configurableProperties?.forEach(prop => {
                if (prop.type === 'toggle') defaultConfig[prop.id] = 'off';
                if (prop.type === 'select' && prop.options) defaultConfig[prop.id] = prop.options[0];
            });

            const newComponent: PlacedComponent = {
                instanceId: `${componentId}-${Date.now()}`,
                component, x, y, config: defaultConfig,
            };
            setPlacedComponents(prev => [...prev, newComponent]);
        }
    };

    const handleComponentMove = (instanceId: string, x: number, y: number) => {
        setPlacedComponents(prev => prev.map(pc => pc.instanceId === instanceId ? { ...pc, x, y } : pc));
    };

    const handleConfigChange = (instanceId: string, newConfig: ComponentConfig) => {
         setPlacedComponents(prev => prev.map(pc => pc.instanceId === instanceId ? { ...pc, config: newConfig } : pc));
    };

    const handlePortClick = (instanceId: string, portId: string) => {
        const component = placedComponents.find(pc => pc.instanceId === instanceId)?.component;
        if (!component) return;
        const port = component.ports.find(p => p.id === portId);
        if (!port) return;

        if (!wiringState) {
            setWiringState({ from: { instanceId, portId }, fromPortType: port.type });
        } else {
            if (wiringState.from.instanceId === instanceId || wiringState.fromPortType === port.type) {
                setWiringState(null);
                return;
            }
            const fromIsOutput = wiringState.fromPortType === 'output';
            const newConnection: Connection = {
                id: `conn-${Date.now()}`,
                from: fromIsOutput ? wiringState.from : { instanceId, portId },
                to: fromIsOutput ? { instanceId, portId } : wiringState.from,
            };
            setConnections(prev => [...prev, newConnection]);
            setWiringState(null);
        }
    };
    
    const getPortPosition = useCallback((instanceId: string, portId: string) => {
        const component = placedComponents.find(pc => pc.instanceId === instanceId);
        if (!component) return null;
        const port = component.component.ports.find(p => p.id === portId);
        if (!port) return null;
        
        const isInput = port.type === 'input';
        const portCount = component.component.ports.filter(p => p.type === port.type).length;
        const portIndex = component.component.ports.filter(p => p.type === port.type).findIndex(p => p.id === portId);
        
        const x = component.x + (isInput ? -5 : 192 + 5); // w-48 is 192px
        const y = component.y + (80 / (portCount + 1)) * (portIndex + 1);
        return { x, y };
    }, [placedComponents]);
    
    const handleWorkbenchMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!wiringState || !e.currentTarget) return;
        const fromPos = getPortPosition(wiringState.from.instanceId, wiringState.from.portId);
        if (!fromPos) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setPreviewLine({ x1: fromPos.x, y1: fromPos.y, x2: e.clientX - rect.left, y2: e.clientY - rect.top });
    };

    useEffect(() => { if (!wiringState) setPreviewLine(null); }, [wiringState]);

    const selectedComponent = useMemo(() => 
        placedComponents.find(pc => pc.instanceId === selectedComponentInstanceId) || null,
        [placedComponents, selectedComponentInstanceId]
    );
    
    const handleSimulate = () => {
        addLog("شبیه‌سازی شروع شد.", "success");
        setSimulationState('running');
    }

    return (
        <div className="max-w-screen-2xl mx-auto py-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-4">آزمایشگاه کوانتومی (نسخه شبیه‌ساز)</h2>
                <p className="text-gray-400 mb-6 max-w-3xl mx-auto">
                    قطعات را بچینید، آن‌ها را پیکربندی کنید و با زدن دکمه "شروع"، عبور فوتون‌ها را در مدار کوانتومی خود مشاهده نمایید.
                </p>
                <div className="flex justify-center items-center gap-2 sm:gap-4 flex-wrap p-2 glassmorphic rounded-xl max-w-fit mx-auto">
                    <ProtocolSelector selected={protocol} onChange={(p) => { setProtocol(p); handleFetchExplanation(p); }} disabled={isLoading || simulationState !== 'stopped'} />
                    
                    <div className="h-8 border-l border-brand-border mx-2"></div>

                    <button onClick={handleSimulate} disabled={simulationState !== 'stopped'} className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200 text-sm flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                        <span>شروع</span>
                    </button>
                    <button onClick={() => setSimulationState('paused')} disabled={simulationState !== 'running'} className="px-4 py-2 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200 text-sm flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg>
                        <span>مکث</span>
                    </button>
                     <button onClick={resetWorkbench} disabled={simulationState !== 'stopped'} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200 text-sm flex items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h.01a1 1 0 100-2H9V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 001 1h.01a1 1 0 100-2H13V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        <span>بازنشانی</span>
                    </button>
                </div>
            </div>

            <div className="mt-8">
                {isLoading && <Loader text={`...در حال بارگذاری آزمایشگاه ${protocol}`} />}
                {explanation && !isLoading && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[75vh]">
                       <aside className="lg:col-span-3 h-full">
                           <ComponentPalette components={explanation.components} />
                       </aside>
                       <main className="lg:col-span-6 h-full">
                           <Workbench 
                             placedComponents={placedComponents}
                             connections={connections}
                             wiringState={wiringState}
                             previewLine={previewLine}
                             onDrop={handleDrop}
                             onComponentMove={handleComponentMove}
                             onSelectComponent={setSelectedComponentInstanceId}
                             selectedComponentInstanceId={selectedComponentInstanceId}
                             onPortClick={handlePortClick}
                             onWiringCancel={() => setWiringState(null)}
                             onWorkbenchMouseMove={handleWorkbenchMouseMove}
                           />
                       </main>
                       <aside className="lg:col-span-3 h-full">
                           <InfoPanel explanation={explanation} selectedComponent={selectedComponent} logs={logs} onConfigChange={handleConfigChange} />
                       </aside>
                    </div>
                )}
            </div>
        </div>
    )
}