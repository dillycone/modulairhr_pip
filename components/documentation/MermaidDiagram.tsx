'use client'

import { useEffect, useRef } from 'react';

// Import mermaid directly from CDN to avoid build issues
export default function MermaidDiagram({ chart, className = '' }: { chart: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run this on the client
    if (typeof window === 'undefined' || !containerRef.current) return;

    // Function to load Mermaid from CDN
    const loadMermaid = () => {
      return new Promise<any>((resolve, reject) => {
        // Check if already loaded
        if (window.mermaid) {
          resolve(window.mermaid);
          return;
        }

        // Create script element
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js';
        script.async = true;
        script.onload = () => {
          if (window.mermaid) {
            window.mermaid.initialize({
              startOnLoad: false,
              theme: 'default',
              securityLevel: 'loose'
            });
            resolve(window.mermaid);
          } else {
            reject(new Error('Mermaid not available after loading'));
          }
        };
        script.onerror = () => reject(new Error('Failed to load Mermaid from CDN'));
        document.head.appendChild(script);
      });
    };

    // Render the diagram
    const renderDiagram = async () => {
      if (!containerRef.current) return;
      
      try {
        const mermaid = await loadMermaid();
        
        // Clear the container
        while (containerRef.current && containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
        
        // Create a unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substring(2, 10)}`;
        
        // Use mermaid render API to generate SVG
        const { svg } = await mermaid.render(id, chart);
        
        // Set the inner HTML to the generated SVG
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (error: any) {
        console.error('Error rendering Mermaid diagram:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="p-4 border border-red-200 rounded bg-red-50">
              <p class="font-semibold text-red-700">Failed to render diagram</p>
              <p class="text-sm text-red-600">${error.message || 'Unknown error'}</p>
              <div class="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                <pre class="text-xs">${chart}</pre>
              </div>
            </div>
          `;
        }
      }
    };

    renderDiagram();
  }, [chart]);

  return (
    <div className={`my-5 ${className}`}>
      <div ref={containerRef} className="overflow-auto p-4 bg-white border border-gray-200 rounded-lg">
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
          <span className="ml-2 text-gray-500">Rendering diagram...</span>
        </div>
      </div>
    </div>
  );
}

// Add the mermaid type to Window
declare global {
  interface Window {
    mermaid: any;
  }
} 