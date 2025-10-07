import React from 'react';
import type { Protocol } from '../types';

interface DiagramProps {
    protocol: Protocol;
    onComponentClick: (id: string) => void;
    selectedComponentId: string | null;
}

const BB84Diagram: React.FC<Omit<DiagramProps, 'protocol'>> = ({ onComponentClick, selectedComponentId }) => (
    <svg viewBox="0 0 800 300" className="w-full h-auto">
        <defs>
            <linearGradient id="laserBeam" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
                <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </linearGradient>
            <filter id="glow">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>

        {/* Labels */}
        <text x="250" y="40" fontFamily="sans-serif" fontSize="20" fill="white" textAnchor="middle">آلیس</text>
        <rect x="50" y="50" width="400" height="220" rx="10" fill="none" stroke="rgba(255,255,255,0.2)" strokeDasharray="5,5" />
        <text x="650" y="40" fontFamily="sans-serif" fontSize="20" fill="white" textAnchor="middle">باب</text>
        <rect x="550" y="50" width="200" height="220" rx="10" fill="none" stroke="rgba(255,255,255,0.2)" strokeDasharray="5,5" />

        {/* Photon Path */}
        <path d="M 50 150 H 480" stroke="url(#laserBeam)" strokeWidth="3" filter="url(#glow)" />
        <path d="M 520 150 H 580" stroke="url(#laserBeam)" strokeWidth="3" filter="url(#glow)" />
        <path d="M 620 150 L 650 120 L 700 120" stroke="url(#laserBeam)" strokeWidth="2" filter="url(#glow)" strokeOpacity="0.7"/>
        <path d="M 620 150 L 650 180 L 700 180" stroke="url(#laserBeam)" strokeWidth="2" filter="url(#glow)" strokeOpacity="0.7"/>


        {/* Components */}
        <g id="laser-source" onClick={() => onComponentClick('laser-source')} className="cursor-pointer group">
            <rect x="60" y="135" width="40" height="30" rx="5" fill={selectedComponentId === 'laser-source' ? '#164e63' : '#334155'} stroke="#22d3ee" strokeWidth="1.5" className="transition-all" />
            <path d="M 100 150 l 15 -5 v 10 z" fill="#22d3ee" />
            <text x="80" y="180" fontFamily="sans-serif" fontSize="12" fill="white" textAnchor="middle" className="group-hover:fill-cyan-300 transition-all">لیزر</text>
        </g>
        
        <g id="attenuator" onClick={() => onComponentClick('attenuator')} className="cursor-pointer group">
            <rect x="150" y="130" width="20" height="40" rx="3" fill={selectedComponentId === 'attenuator' ? '#164e63' : '#334155'} stroke="#22d3ee" strokeWidth="1.5" className="transition-all"/>
            <path d="M 155 135 L 165 165 M 165 135 L 155 165" stroke="#94a3b8" strokeWidth="1" />
             <text x="160" y="185" fontFamily="sans-serif" fontSize="12" fill="white" textAnchor="middle" className="group-hover:fill-cyan-300 transition-all">تضعیف‌کننده</text>
        </g>

        <g id="alice-polarizer" onClick={() => onComponentClick('alice-polarizer')} className="cursor-pointer group">
            <circle cx="250" cy="150" r="25" fill={selectedComponentId === 'alice-polarizer' ? '#164e63' : '#334155'} stroke="#22d3ee" strokeWidth="1.5" className="transition-all"/>
            <path d="M 250 130 v 40 M 230 150 h 40" stroke="#94a3b8" strokeWidth="1.5" transform="rotate(20 250 150)"/>
            <text x="250" y="195" fontFamily="sans-serif" fontSize="12" fill="white" textAnchor="middle" className="group-hover:fill-cyan-300 transition-all">قطبشگر</text>
        </g>
        
        <text id="quantum-channel" onClick={() => onComponentClick('quantum-channel')} x="490" y="140" fontFamily="sans-serif" fontSize="12" fill="white" className="cursor-pointer group-hover:fill-cyan-300 transition-all">کانال کوانتومی</text>
        
        <g id="bob-polarizer" onClick={() => onComponentClick('bob-polarizer')} className="cursor-pointer group">
            <circle cx="500" cy="150" r="25" fill={selectedComponentId === 'bob-polarizer' ? '#164e63' : '#334155'} stroke="#22d3ee" strokeWidth="1.5" className="transition-all"/>
            <path d="M 485 135 l 30 30 m 0 -30 l -30 30" stroke="#94a3b8" strokeWidth="1.5"/>
            <text x="500" y="195" fontFamily="sans-serif" fontSize="12" fill="white" textAnchor="middle" className="group-hover:fill-cyan-300 transition-all">قطبشگر</text>
        </g>

        <g id="beam-splitter" onClick={() => onComponentClick('beam-splitter')} className="cursor-pointer group">
            <rect x="580" y="110" width="40" height="80" fill={selectedComponentId === 'beam-splitter' ? '#164e63' : '#334155'} stroke="#22d3ee" strokeWidth="1.5" rx="5" className="transition-all"/>
            <line x1="585" y1="185" x2="615" y2="115" stroke="#94a3b8" strokeWidth="2" />
            <text x="600" y="210" fontFamily="sans-serif" fontSize="12" fill="white" textAnchor="middle" className="group-hover:fill-cyan-300 transition-all">شکافنده پرتو</text>
        </g>

        <g id="photon-detectors" onClick={() => onComponentClick('photon-detectors')} className="cursor-pointer group">
            <rect x="700" y="105" width="50" height="30" rx="5" fill={selectedComponentId === 'photon-detectors' ? '#164e63' : '#334155'} stroke="#22d3ee" strokeWidth="1.5" className="transition-all"/>
            <text x="725" y="123" fontFamily="sans-serif" fontSize="12" fill="white" textAnchor="middle">D1</text>
            <rect x="700" y="165" width="50" height="30" rx="5" fill={selectedComponentId === 'photon-detectors' ? '#164e63' : '#334155'} stroke="#22d3ee" strokeWidth="1.5" className="transition-all"/>
            <text x="725" y="183" fontFamily="sans-serif" fontSize="12" fill="white" textAnchor="middle">D2</text>
            <text x="725" y="215" fontFamily="sans-serif" fontSize="12" fill="white" textAnchor="middle" className="group-hover:fill-cyan-300 transition-all">آشکارسازها</text>
        </g>
    </svg>
);

const E91Diagram: React.FC<Omit<DiagramProps, 'protocol'>> = ({ onComponentClick, selectedComponentId }) => (
    <svg viewBox="0 0 800 300" className="w-full h-auto">
         <defs>
            <linearGradient id="laserBeam" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
                <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </linearGradient>
            <filter id="glow">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>

        {/* Labels */}
        <text x="175" y="40" fontFamily="sans-serif" fontSize="20" fill="white" textAnchor="middle">آلیس</text>
        <rect x="50" y="50" width="250" height="220" rx="10" fill="none" stroke="rgba(255,255,255,0.2)" strokeDasharray="5,5" />
        <text x="625" y="40" fontFamily="sans-serif" fontSize="20" fill="white" textAnchor="middle">باب</text>
        <rect x="500" y="50" width="250" height="220" rx="10" fill="none" stroke="rgba(255,255,255,0.2)" strokeDasharray="5,5" />

        {/* Photon Paths */}
        <path d="M 400 150 H 220" stroke="url(#laserBeam)" strokeWidth="3" filter="url(#glow)" />
        <path d="M 400 150 H 580" stroke="url(#laserBeam)" strokeWidth="3" filter="url(#glow)" />

        {/* Components */}
        <g id="entangled-source" onClick={() => onComponentClick('entangled-source')} className="cursor-pointer group">
            <circle cx="400" cy="150" r="30" fill={selectedComponentId === 'entangled-source' ? '#164e63' : '#334155'} stroke="#22d3ee" strokeWidth="1.5" className="transition-all"/>
            <path d="M 385 150 a 15 15 0 0 1 30 0 a 15 15 0 0 1 -30 0" fill="none" stroke="#94a3b8" strokeWidth="1.5"/>
            <text x="400" y="200" fontFamily="sans-serif" fontSize="12" fill="white" textAnchor="middle" className="group-hover:fill-cyan-300 transition-all">منبع درهم‌تنیده</text>
        </g>
        
        <g id="alice-polarizer" onClick={() => onComponentClick('alice-polarizer')} className="cursor-pointer group">
            <circle cx="175" cy="150" r="25" fill={selectedComponentId === 'alice-polarizer' ? '#164e63' : '#334155'} stroke="#22d3ee" strokeWidth="1.5" className="transition-all"/>
            <path d="M 175 130 v 40 M 155 150 h 40" stroke="#94a3b8" strokeWidth="1.5" transform="rotate(30 175 150)"/>
            <text x="175" y="195" fontFamily="sans-serif" fontSize="12" fill="white" textAnchor="middle" className="group-hover:fill-cyan-300 transition-all">قطبشگر</text>
        </g>
        
        <g id="alice-detectors" onClick={() => onComponentClick('alice-detectors')} className="cursor-pointer group">
            <path d="M 150 150 H 100" stroke="url(#laserBeam)" strokeWidth="2" filter="url(#glow)"/>
            <rect x="60" y="135" width="40" height="30" rx="5" fill={selectedComponentId === 'alice-detectors' ? '#164e63' : '#334155'} stroke="#22d3ee" strokeWidth="1.5" className="transition-all"/>
            <text x="80" y="153" fontFamily="sans-serif" fontSize="12" fill="white" textAnchor="middle">D</text>
            <text x="80" y="180" fontFamily="sans-serif" fontSize="12" fill="white" textAnchor="middle" className="group-hover:fill-cyan-300 transition-all">آشکارساز</text>
        </g>

        <g id="bob-polarizer" onClick={() => onComponentClick('bob-polarizer')} className="cursor-pointer group">
            <circle cx="625" cy="150" r="25" fill={selectedComponentId === 'bob-polarizer' ? '#164e63' : '#334155'} stroke="#22d3ee" strokeWidth="1.5" className="transition-all"/>
            <path d="M 610 135 l 30 30 m 0 -30 l -30 30" stroke="#94a3b8" strokeWidth="1.5"/>
            <text x="625" y="195" fontFamily="sans-serif" fontSize="12" fill="white" textAnchor="middle" className="group-hover:fill-cyan-300 transition-all">قطبشگر</text>
        </g>

        <g id="bob-detectors" onClick={() => onComponentClick('bob-detectors')} className="cursor-pointer group">
            <path d="M 650 150 H 700" stroke="url(#laserBeam)" strokeWidth="2" filter="url(#glow)"/>
            <rect x="700" y="135" width="40" height="30" rx="5" fill={selectedComponentId === 'bob-detectors' ? '#164e63' : '#334155'} stroke="#22d3ee" strokeWidth="1.5" className="transition-all"/>
            <text x="720" y="153" fontFamily="sans-serif" fontSize="12" fill="white" textAnchor="middle">D</text>
            <text x="720" y="180" fontFamily="sans-serif" fontSize="12" fill="white" textAnchor="middle" className="group-hover:fill-cyan-300 transition-all">آشکارساز</text>
        </g>
        
        <g id="coincidence-counter" onClick={() => onComponentClick('coincidence-counter')} className="cursor-pointer group">
             <path d="M 80 165 v 50 h 640 v -50" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="4,4" fill="none"/>
             <rect x="360" y="230" width="80" height="30" rx="5" fill={selectedComponentId === 'coincidence-counter' ? '#164e63' : '#334155'} stroke="#a78bfa" strokeWidth="1.5" className="transition-all"/>
             <text x="400" y="250" fontFamily="sans-serif" fontSize="12" fill="white" textAnchor="middle" className="group-hover:fill-violet-300 transition-all">شمارنده هم‌زمانی</text>
        </g>

    </svg>
);


export const QuantumSetupDiagram: React.FC<DiagramProps> = ({ protocol, onComponentClick, selectedComponentId }) => {
    return protocol === 'BB84' 
      ? <BB84Diagram onComponentClick={onComponentClick} selectedComponentId={selectedComponentId}/> 
      : <E91Diagram onComponentClick={onComponentClick} selectedComponentId={selectedComponentId} />;
};
