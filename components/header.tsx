"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut, Settings, LayoutDashboard } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Routes that should hide marketing navigation
const AUTHENTICATED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings'
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { user, signOut, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  // Check if current path is an authenticated route
  const isAuthenticatedRoute = AUTHENTICATED_ROUTES.some(route => pathname?.startsWith(route))

  useEffect(() => {
    setIsClient(true)
    
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSignOut = async () => {
    try {
      // Clear auth bypass token if it exists
      document.cookie = "auth_bypass_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      
      // Clear Supabase cookies
      document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie = "sb-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      
      // Call the signOut function from useAuth
      await signOut();
      
      // Force redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Error during sign out:', error);
      // Force redirect on error as well
      window.location.href = '/';
    }
  }

  const navigateToDashboard = (e: React.MouseEvent) => {
    e.preventDefault()
    console.log("Direct navigation to dashboard triggered", { 
      hasUser: !!user,
      isLoading: loading,
      isClient,
      pathname 
    })
    
    // Use window.location for reliable navigation
    window.location.href = '/dashboard'
  }

  // Only render auth-dependent elements when client-side and not loading
  const showAuthUI = isClient && !loading

  return (
    <header
      className={`w-full sticky top-0 z-50 transition-all duration-200 ${isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"}`}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white font-bold">
              M
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
              PIP Assistant | A ModulAIr HR Solution
            </span>
          </Link>
        </div>
        {!isAuthenticatedRoute && (
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors">
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
            >
              How It Works
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors">
              Pricing
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
            >
              Testimonials
            </Link>
            <Link href="#faq" className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors">
              FAQ
            </Link>
          </nav>
        )}
        <div className="hidden md:flex items-center gap-4">
          {showAuthUI && user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-user.jpg" alt={user.email || "User avatar"} />
                      <AvatarFallback>{user.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email || "user@example.com"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/dashboard" passHref legacyBehavior>
                    <DropdownMenuItem>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/profile" passHref legacyBehavior>
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/settings" passHref legacyBehavior>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="/dashboard" passHref>
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" className="text-slate-700 hover:text-indigo-600 hover:bg-indigo-50">
                  Log In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full">Get Started</Button>
              </Link>
            </>
          )}
        </div>
        <button
          className="flex items-center justify-center rounded-md p-2 md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          <span className="sr-only">Toggle menu</span>
        </button>
      </div>
      {isMenuOpen && (
        <div className="container md:hidden bg-white">
          <nav className="flex flex-col gap-4 p-4">
            {!isAuthenticatedRoute && (
              <>
                <Link
                  href="#features"
                  className="text-sm font-medium text-slate-700 hover:text-indigo-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="#how-it-works"
                  className="text-sm font-medium text-slate-700 hover:text-indigo-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  How It Works
                </Link>
                <Link
                  href="#pricing"
                  className="text-sm font-medium text-slate-700 hover:text-indigo-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="#testimonials"
                  className="text-sm font-medium text-slate-700 hover:text-indigo-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Testimonials
                </Link>
                <Link
                  href="#faq"
                  className="text-sm font-medium text-slate-700 hover:text-indigo-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  FAQ
                </Link>
              </>
            )}
            {showAuthUI && user ? (
              <>
                <Link href="/dashboard" className="w-full">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-700 hover:text-indigo-600 hover:bg-indigo-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Button>
                </Link>
                <Link href="/profile" className="w-full">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-700 hover:text-indigo-600 hover:bg-indigo-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Button>
                </Link>
              </>
            ) : (
              // Rest of mobile menu for logged out users
              <>
                <Link href="/auth/login" className="w-full">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-700 hover:text-indigo-600 hover:bg-indigo-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log In
                  </Button>
                </Link>
                <Link href="/auth/signup" className="w-full">
                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

