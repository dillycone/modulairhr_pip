import type { Metadata } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'
import { StaticHeaderLogo } from '@/components/ClientHeaderWrapper'
import RootLayoutClientWrapper from '@/components/RootLayoutClientWrapper'
import ToasterClientSide from '@/components/ToasterClientSide'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PIP Assistant | ModulAIr',
  description: 'Accelerated Performance Improvement Plans powered by AI',
  generator: 'v0.dev',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    other: [
      { rel: 'manifest', url: '/site.webmanifest' }
    ]
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Static content that doesn't need client-side auth */}
        <StaticHeaderLogo />
        
        {/* Client wrapper for all client-side components */}
        <RootLayoutClientWrapper>
          {children}
        </RootLayoutClientWrapper>
        
        {/* Client-side Toaster */}
        <ToasterClientSide />
      </body>
    </html>
  )
}
