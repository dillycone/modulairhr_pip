'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'

// Server-rendered static logo part that will always be visible during SSR
export function StaticHeaderLogo() {
  return (
    <div className="w-full sticky top-0 z-50 bg-transparent">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white font-bold">
              M
            </div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
              PIP Assistant | A ModulAIr HR Solution
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}

// Dynamically import Header with SSR disabled for auth-dependent UI
const Header = dynamic(() => import('@/components/header'), {
  ssr: false,
})

export default function ClientHeaderWrapper() {
  // This component exists to wrap the dynamic import in a client boundary
  return <Header />
}