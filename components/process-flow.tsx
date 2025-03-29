"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, LineChart, BarChart, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProcessFlow() {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      title: "Create Plan",
      description: "Use our templates or AI-assisted tools to quickly create customized performance improvement plans.",
      icon: FileText,
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Track Progress",
      description: "Monitor employee progress with real-time updates, milestones, and completion metrics.",
      icon: LineChart,
      color: "from-indigo-500 to-purple-600",
    },
    {
      title: "Generate Reports",
      description: "Create comprehensive reports to document progress, identify trends, and inform decisions.",
      icon: BarChart,
      color: "from-purple-500 to-pink-600",
    },
    {
      title: "Achieve Results",
      description: "Improve employee performance and document outcomes for better organizational results.",
      icon: CheckCircle,
      color: "from-pink-500 to-red-600",
    },
  ]

  return (
    <div className="mt-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1">
          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div
                  key={index}
                  className={`flex gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer ${activeStep === index ? "bg-slate-50 shadow-sm" : "hover:bg-slate-50"}`}
                  onClick={() => setActiveStep(index)}
                >
                  <div className={`rounded-lg bg-gradient-to-r ${step.color} p-3 text-white h-fit`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">
                      {index + 1}. {step.title}
                    </h3>
                    <p className="text-slate-600">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-8">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8"
              onClick={() => setActiveStep((activeStep + 1) % steps.length)}
            >
              See Next Step
            </Button>
          </div>
        </div>
        <div className="order-1 md:order-2">
          <Card className="border-slate-200 shadow-xl overflow-hidden">
            <div className={`h-2 w-full bg-gradient-to-r ${steps[activeStep].color}`}></div>
            <CardContent className="p-0">
              <div className="relative aspect-[4/3] w-full">
                <img
                  src="/placeholder.svg?height=600&width=800"
                  alt={`PIP Assistant ${steps[activeStep].title} Screenshot`}
                  className="object-cover w-full h-full"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

