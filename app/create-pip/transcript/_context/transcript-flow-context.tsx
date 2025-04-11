'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';

// Define the state interface
interface Speaker {
  name: string;
  role: string;
}

interface TranscriptFlowState {
  transcript: string | null;
  summary: string | null;
  title: string;
  speakers: Speaker[];
}

// Define action types
type TranscriptFlowAction =
  | { type: 'SET_TRANSCRIPT'; payload: string }
  | { type: 'SET_SUMMARY'; payload: string }
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'SET_SPEAKERS'; payload: Speaker[] };

// Initial state
const initialState: TranscriptFlowState = {
  transcript: null,
  summary: null,
  title: 'Untitled Transcript',
  speakers: []
};

// Create a context
const TranscriptFlowContext = createContext<{
  state: TranscriptFlowState;
  dispatch: React.Dispatch<TranscriptFlowAction>;
} | undefined>(undefined);

// Reducer function
function transcriptFlowReducer(state: TranscriptFlowState, action: TranscriptFlowAction): TranscriptFlowState {
  switch (action.type) {
    case 'SET_TRANSCRIPT':
      return { ...state, transcript: action.payload };
    case 'SET_SUMMARY':
      return { ...state, summary: action.payload };
    case 'SET_TITLE':
      return { ...state, title: action.payload };
    case 'SET_SPEAKERS':
      return { ...state, speakers: action.payload };
    default:
      return state;
  }
}

// Provider component
export function TranscriptFlowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(transcriptFlowReducer, initialState);
  return (
    <TranscriptFlowContext.Provider value={{ state, dispatch }}>
      {children}
    </TranscriptFlowContext.Provider>
  );
}

// Custom hook to use the context
export function useTranscriptFlow() {
  const context = useContext(TranscriptFlowContext);
  if (context === undefined) {
    throw new Error('useTranscriptFlow must be used within a TranscriptFlowProvider');
  }
  return context;
}