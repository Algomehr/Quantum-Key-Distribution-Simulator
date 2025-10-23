import React from 'react';

// Default icon for any component that doesn't have a specific one
export const DefaultComponentIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9.75l-9-5.25M12 15v5.25" />
    </svg>
);

export const LaserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5a6 6 0 00-6-6v1.5a6 6 0 00-6 6v1.5a6 6 0 006 6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75h.008v.008H12v-.008z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15l-1.5-1.5m1.5 1.5l1.5-1.5m-1.5 1.5V9m3 6l1.5-1.5M9 15l-1.5-1.5M12 9l1.5 1.5M12 9L10.5 10.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 12h-3m-13.5 0h-3" />
    </svg>
);


export const PolarizerIcon = ({ basis, ...props }: React.SVGProps<SVGSVGElement> & { basis?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <circle cx="12" cy="12" r="9" strokeOpacity="0.5" />
        <g transform={`rotate(${basis === 'x' ? 45 : 0} 12 12)`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" strokeOpacity="0.3"/>
        </g>
    </svg>
);

export const DetectorIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
    </svg>
);

export const EntangledSourceIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path d="M12 2a3 3 0 00-3 3v1.5a.5.5 0 01-1 0V5a4 4 0 018 0v1.5a.5.5 0 01-1 0V5a3 3 0 00-3-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c-3.5 0-6.5-2-8-5m16 5c-1.5 3-4.5 5-8 5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.5c3.5 1.5 6.5 1.5 10 0" opacity="0.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
    </svg>
);

export const BeamSplitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m-9-9h18" opacity="0.3"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15" />
    </svg>
);
