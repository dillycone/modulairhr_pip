'use client'

import dynamic from 'next/dynamic'
import { useAuth } from "@/hooks/useAuth"
import { usePathname } from "next/navigation"

// Routes that should hide marketing content
const AUTHENTICATED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings',
  '/create-pip'
];

// Dynamically import Footer with SSR disabled
const Footer = dynamic(() => import('@/components/footer'), {
  ssr: false
})

export default function ClientFooterWrapper() {
  const { user } = useAuth()
  const pathname = usePathname()
  
  // Check if current path is an authenticated route
  const isAuthenticatedRoute = AUTHENTICATED_ROUTES.some(route => pathname?.startsWith(route))
  
  // Only show footer when not authenticated or not on an authenticated route
  if (user && isAuthenticatedRoute) {
    return null
  }
  
  return <Footer />
}