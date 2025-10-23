export type Protocol = 'BB84' | 'E91';
export type NoiseModel = 'SimpleQBER' | 'Depolarizing';

export enum Basis {
  Rectilinear = '+',
  Diagonal = 'x',
}

export enum Bit {
  Zero = 0,
  One = 1,
}

export interface Qubit {
  id: number;
  // For BB84: The bit Alice sends.
  // For E91: The correlated outcome for Alice if bases match.
  aliceBit: Bit;
  // For BB84: The basis Alice uses to encode.
  // For E91: The basis Alice uses to measure.
  aliceBasis: Basis;
  eveInterfered: boolean;
  eveBasis?: Basis;
  // For BB84: The bit Eve measures and resends.
  // For E91: The bit Eve measures.
  eveBit?: Bit;
  channelError: boolean;
  // For BB84: The basis Bob uses to measure.
  // For E91: The basis Bob uses to measure.
  bobBasis: Basis;
  // For BB84: The bit Bob measures.
  // For E91: The bit Bob measures.
  bobBit: Bit;
  basisMatch: boolean;
  keyMatch?: boolean;
}

export interface SimulationParams {
  protocol: Protocol;
  qubitCount: number;
  runCount: number;
  noiseModel: NoiseModel;
  rectilinearBasisPercent: number;
  eavesdropPercent: number;
  qberPercent: number;
}

export interface SimulationResult {
  qubits: Qubit[];
  siftedKeyLength: number;
  finalKeyLength: number;
  measuredQBER: number;
}

export interface AggregatedSimulationResult {
  totalRuns: number;
  avgSiftedKeyLength: number;
  avgFinalKeyLength: number;
  avgMeasuredQBER: number;
  finalKeyRate: number; // Final key bits per initial qubit
  lastRun: SimulationResult; // To display in the detailed view
}


export interface EducationalContent {
  prerequisites: string;
  protocolSteps: string;
  securityAnalysis: string;
}

export interface LLMAnalysis {
  textual: string;
  mathematical: string;
  educational?: EducationalContent;
}

// Types for Quantum Lab
export interface Port {
  id: string; // e.g., 'in1', 'out_h'
  type: 'input' | 'output';
  name: string; // Persian label e.g., 'ورودی'
}

export interface ConfigurableProperty {
    id: string; // e.g. 'basis'
    label: string; // e.g. 'مبنا'
    type: 'toggle' | 'select';
    options?: string[]; // e.g. ['+', 'x']
}

export interface QuantumComponent {
  id: string; // e.g., 'laser-source'
  name: string;
  description: string;
  ports: Port[];
  configurableProperties?: ConfigurableProperty[];
}

export interface QuantumSetupExplanation {
  title: string;
  overview: string;
  components: QuantumComponent[];
  process: string;
}

export interface ComponentConfig {
    [key: string]: any; // e.g. { power: 'on', basis: '+' }
}

export interface PlacedComponent {
  instanceId: string;
  component: QuantumComponent;
  x: number;
  y: number;
  config: ComponentConfig;
}

export interface Connection {
  id: string;
  from: {
    instanceId: string;
    portId: string;
  };
  to: {
    instanceId: string;
    portId: string;
  };
}

export type SimulationState = 'stopped' | 'running' | 'paused';

export interface SimulationLog {
  id: number;
  timestamp: number;
  message: string;
  type: 'info' | 'success' | 'error' | 'photon';
}
