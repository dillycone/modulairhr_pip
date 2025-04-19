'use client'

import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

// Dynamically import client components with SSR disabled
const ClientHeaderWrapper = dynamic(() => import('@/components/ClientHeaderWrapper'), { ssr: false })
const ClientFooterWrapper = dynamic(() => import('@/components/ClientFooterWrapper'), { ssr: false })
const AuthProvider = dynamic(() => import('@/components/auth/auth-provider').then(mod => mod.AuthProvider), { ssr: false })

export default function RootLayoutClientWrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ClientHeaderWrapper />
      {children}
      <ClientFooterWrapper />
    </AuthProvider>
  )
} 