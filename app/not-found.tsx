import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="text-3xl font-bold mb-4">404 - Page Not Found</h2>
      <p className="text-lg mb-6">The page you're looking for doesn't exist or has been moved.</p>
      <Link 
        href="/" 
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-colors"
      >
        Return Home
      </Link>
    </div>
  )
} 