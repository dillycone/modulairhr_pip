import FaqAccordion from "@/components/faq/faq-accordion"
import { Badge } from "@/components/ui/badge"

export default function FaqSection() {
  return (
    <section className="w-full py-16 md:py-24 bg-slate-50" id="faq">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors">FAQ</Badge>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="max-w-[700px] text-slate-600 md:text-xl">
              Find answers to common questions about PIP Assistant
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-3xl">
          <FaqAccordion />
        </div>
      </div>
    </section>
  )
} 