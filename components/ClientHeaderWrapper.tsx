'use client'

import dynamic from 'next/dynamic'

// Dynamically import Header with SSR disabled
const Header = dynamic(() => import('@/components/header'), {
  ssr: false,
  // Optional: Add a loading component while Header is loading
  // loading: () => <div className="h-16 bg-gray-200 animate-pulse"></div>,
})

export default function ClientHeaderWrapper() {
  // This component only exists to wrap the dynamic import in a client boundary
  return <Header />
} 