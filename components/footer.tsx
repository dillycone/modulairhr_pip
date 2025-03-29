import Link from "next/link"
import { Facebook, Twitter, Linkedin, Mail } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white">
      <div className="container px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white font-bold">
                P
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
                PIP Assistant
              </span>
            </Link>
            <p className="text-sm text-slate-600">
              Streamlining performance improvement plans for HR professionals and managers at pipassistant.com.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-900 mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#features" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">
                  Integrations
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-900 mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-900 mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-200 text-center text-sm text-slate-600">
          <p>© {new Date().getFullYear()} PIP Assistant. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

