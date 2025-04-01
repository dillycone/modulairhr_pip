'use client'

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the DocumentationViewer to avoid SSR issues with Mermaid
const DocumentationViewer = dynamic(
  () => import('@/components/documentation/DocumentationViewer'),
  { 
    ssr: false,
    loading: () => <div className="text-center p-8">Loading documentation...</div>
  }
);

export default function GoogleAuthDocumentation() {
  const [documentationContent, setDocumentationContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [currentPort, setCurrentPort] = useState<string>('3000');

  useEffect(() => {
    // Get the current port for display purposes
    const port = window.location.port || '3000';
    setCurrentPort(port);
    
    async function fetchDocumentation() {
      try {
        setIsLoading(true);
        setError(null);

        // Always use the current origin to ensure port matches
        const origin = window.location.origin;
        const apiUrl = `${origin}/api/documentation/google-auth`;
        
        console.log('Fetching documentation from:', apiUrl);
        
        // Fetch the documentation file
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        // Save the raw API response for debugging
        setApiResponse(data);
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch documentation');
        }
        
        if (!data.content) {
          throw new Error('No content returned from API');
        }
        
        console.log('Documentation loaded successfully:', { 
          contentLength: data.content.length,
          containsMermaid: data.containsMermaid
        });
        
        // Replace any hardcoded localhost:3000 references with the current port
        let processedContent = data.content;
        if (port !== '3000') {
          processedContent = processedContent.replace(
            /localhost:3000/g, 
            `localhost:${port}`
          );
        }
        
        setDocumentationContent(processedContent);
      } catch (error) {
        console.error('Error loading documentation:', error);
        setError(error instanceof Error ? error.message : String(error));
      } finally {
        setIsLoading(false);
      }
    }

    fetchDocumentation();
  }, []);

  return (
    <main className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Google Authentication Documentation</h1>
      <p className="mb-6 text-gray-500">
        Currently viewing on port: <span className="font-mono text-primary">{currentPort}</span>
      </p>
      
      {isLoading ? (
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading documentation...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error Loading Documentation</h2>
          <p className="mb-4">{error}</p>
          
          {apiResponse && (
            <details className="mt-4">
              <summary className="cursor-pointer font-medium">API Response Details</summary>
              <pre className="mt-2 p-3 bg-gray-100 text-xs overflow-auto rounded">{JSON.stringify(apiResponse, null, 2)}</pre>
            </details>
          )}
        </div>
      ) : documentationContent ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <DocumentationViewer content={documentationContent} />
          
          {/* Raw content debugging (hidden by default) */}
          <details className="mt-8">
            <summary className="cursor-pointer text-gray-500 text-sm">Show raw documentation content</summary>
            <div className="mt-2">
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">{documentationContent}</pre>
            </div>
          </details>
        </div>
      ) : (
        <div className="bg-yellow-50 text-yellow-600 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">No Documentation Content</h2>
          <p>The documentation was loaded but no content was found.</p>
        </div>
      )}
    </main>
  );
} 