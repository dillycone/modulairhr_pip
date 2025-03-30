import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function CtaSection() {
  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-br from-indigo-600 to-blue-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.1] pointer-events-none"></div>
      <div className="container px-4 md:px-6 relative">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <Badge className="bg-white/20 text-white hover:bg-white/30 transition-colors">Get Started Today</Badge>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
              Ready to Scale Your HR Expertise?
            </h2>
            <p className="max-w-[700px] text-indigo-100 md:text-xl">
              Join hundreds of HR professionals who amplify their impact with PIP Assistant
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row mt-8">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-full px-8">
              Request a Demo
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-indigo-700/50 rounded-full px-8"
            >
              Start Free Trial
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
} 