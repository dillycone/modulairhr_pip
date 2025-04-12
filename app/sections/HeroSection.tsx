import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { WaitlistForm } from "@/components/WaitlistForm"

export default function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-indigo-50 via-blue-50 to-white overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.2] pointer-events-none"></div>
      <div className="container px-4 md:px-6 relative">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-6">
            <Badge className="w-fit bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors">
              Streamline HR Processes
            </Badge>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
                Accelerate Performance Improvement Plans
              </h1>
              <p className="max-w-[600px] text-slate-700 md:text-xl">
                <span className="font-semibold text-indigo-700">Your expertise, scaled.</span> Create, track, and
                manage PIPs with our intuitive platform designed to amplify HR professionals and managers, not replace
                them.
              </p>
            </div>
            <div className="py-2">
              <WaitlistForm />
            </div>
            <div className="flex items-center">
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-5 w-5 text-indigo-600" />
                <span className="text-sm text-slate-600">Early access</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[600px] aspect-video rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-blue-500/10 z-10"></div>
              <Image
                src="/placeholder.svg"
                alt="PIP Assistant Dashboard Preview"
                className="object-cover w-full h-full"
                width={1000}
                height={600}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 