import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ExpertiseSection() {
  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-br from-indigo-50 via-blue-50 to-white relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.2] pointer-events-none"></div>
      <div className="container px-4 md:px-6 relative">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="order-2 lg:order-1">
            <div className="space-y-4">
              <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors">
                Our Philosophy
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-slate-900">
                Your Expertise,{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
                  Scaled
                </span>
              </h2>
              <p className="text-slate-700 text-lg">
                PIP Assistant doesn't replace your HR expertise—it amplifies it. We believe that human judgment,
                empathy, and experience are irreplaceable in performance management.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">
                    Automate repetitive tasks while you focus on meaningful conversations
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">Enhance your decision-making with data-driven insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">
                    Scale your best practices across the organization consistently
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">Free up time to provide personalized coaching and support</span>
                </li>
              </ul>
              <div className="pt-4">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8">
                  Learn Our Approach
                </Button>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative w-full max-w-[500px] aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/placeholder.svg?height=500&width=500"
                alt="HR Professional using PIP Assistant"
                className="object-cover w-full h-full"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-900/80 to-transparent p-6">
                <p className="text-white font-medium">
                  "PIP Assistant helps me apply my expertise more effectively across our organization."
                </p>
                <p className="text-indigo-100 text-sm mt-1">— Jennifer Lopez, HR Director</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 