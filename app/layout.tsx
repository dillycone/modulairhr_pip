import type { Metadata } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import Footer from '@/components/footer'
import ClientHeaderWrapper from '@/components/ClientHeaderWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PIP Assistant | ModulAIr',
  description: 'Accelerated Performance Improvement Plans powered by AI',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientHeaderWrapper />
        {children}
        <Footer />
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
