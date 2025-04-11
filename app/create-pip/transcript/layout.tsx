import { TranscriptFlowProvider } from './_context/transcript-flow-context';

export default function TranscriptFlowLayout({ children }: { children: React.ReactNode }) {
  return <TranscriptFlowProvider>{children}</TranscriptFlowProvider>;
}