'use client'

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import dynamic from 'next/dynamic';

// Import MermaidDiagram dynamically to avoid SSR issues
const MermaidDiagram = dynamic(() => import('./MermaidDiagram'), { ssr: false });

interface DocumentationViewerProps {
  content: string;
  className?: string;
}

export default function DocumentationViewer({ content, className = '' }: DocumentationViewerProps) {
  const [mermaidDiagrams, setMermaidDiagrams] = useState<{[key: string]: string}>({});
  
  // Extract mermaid diagrams on load
  useEffect(() => {
    if (!content) {
      console.log('No content provided to DocumentationViewer');
      return;
    }
    
    console.log('Processing documentation content, length:', content.length);
    
    // Extract mermaid diagrams
    try {
      const mermaidPattern = /```mermaid\n([\s\S]*?)```/g;
      const extractedDiagrams: {[key: string]: string} = {};
      let match;
      let count = 0;
      
      while ((match = mermaidPattern.exec(content)) !== null) {
        const id = `mermaid-${count}`;
        extractedDiagrams[id] = match[1].trim();
        count++;
      }
      
      console.log(`Found ${count} Mermaid diagrams in content`);
      setMermaidDiagrams(extractedDiagrams);
    } catch (error) {
      console.error('Error processing Mermaid diagrams:', error);
    }
  }, [content]);
  
  if (!content) {
    return <div className="text-red-500">No documentation content provided</div>;
  }
  
  // Simple custom renderer for code blocks
  const components = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const lang = match && match[1];
      
      // Render mermaid diagrams
      if (lang === 'mermaid') {
        return <MermaidDiagram chart={String(children).trim()} />;
      }
      
      // Regular code blocks
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };
  
  return (
    <div className={`documentation-viewer ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
      
      {/* Debug section - Display found diagrams */}
      {Object.keys(mermaidDiagrams).length > 0 ? (
        <div className="mt-8 p-4 bg-gray-100 rounded-md">
          <h3 className="font-bold mb-2">Debug: Found {Object.keys(mermaidDiagrams).length} Mermaid diagrams</h3>
          {Object.entries(mermaidDiagrams).map(([id, content], index) => (
            <div key={id} className="mb-4">
              <details>
                <summary className="cursor-pointer font-medium">Diagram #{index + 1}</summary>
                <pre className="mt-2 p-2 bg-gray-200 rounded text-xs overflow-auto">{content}</pre>
              </details>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 p-4 bg-yellow-100 rounded-md">
          <p className="text-yellow-800">No Mermaid diagrams detected in the documentation.</p>
        </div>
      )}
    </div>
  );
} 