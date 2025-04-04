"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FaqAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1" className="border-b border-slate-200">
        <AccordionTrigger className="text-left hover:text-indigo-600 transition-colors">
          What is a Performance Improvement Plan (PIP)?
        </AccordionTrigger>
        <AccordionContent className="text-slate-600">
          A Performance Improvement Plan (PIP) is a formal document that outlines specific areas where an employee needs
          to improve, along with clear goals, expectations, and a timeline for achieving those improvements. It's
          designed to help struggling employees get back on track while documenting the organization's efforts to
          address performance issues.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2" className="border-b border-slate-200">
        <AccordionTrigger className="text-left hover:text-indigo-600 transition-colors">
          How does PIP Assistant help with creating and managing PIPs?
        </AccordionTrigger>
        <AccordionContent className="text-slate-600">
          PIP Assistant streamlines the entire PIP process by providing customizable templates, automated workflows,
          progress tracking tools, and comprehensive reporting. Our platform helps HR professionals and managers create
          fair and effective PIPs, monitor employee progress, and ensure compliance with organizational policies and
          legal requirements.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3" className="border-b border-slate-200">
        <AccordionTrigger className="text-left hover:text-indigo-600 transition-colors">
          Can PIP Assistant integrate with our existing HR systems?
        </AccordionTrigger>
        <AccordionContent className="text-slate-600">
          Yes, PIP Assistant offers integration capabilities with popular HR management systems, calendar applications,
          and communication tools. Our API allows for seamless data exchange between PIP Assistant and your existing
          software ecosystem. For specific integration needs, our Enterprise plan includes custom implementation
          services.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4" className="border-b border-slate-200">
        <AccordionTrigger className="text-left hover:text-indigo-600 transition-colors">
          How secure is our employee data on PIP Assistant?
        </AccordionTrigger>
        <AccordionContent className="text-slate-600">
          PIP Assistant takes data security seriously. We employ industry-standard encryption, regular security audits,
          and strict access controls to protect your sensitive employee information. Our platform is compliant with
          major data protection regulations, and we offer features like SSO integration for Enterprise customers to
          enhance security further.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-5" className="border-b border-slate-200">
        <AccordionTrigger className="text-left hover:text-indigo-600 transition-colors">
          What kind of support does PIP Assistant provide?
        </AccordionTrigger>
        <AccordionContent className="text-slate-600">
          All PIP Assistant plans include access to our knowledge base and email support. Professional plan customers
          receive priority support with faster response times. Enterprise customers benefit from a dedicated account
          manager and personalized onboarding and training sessions. We also offer regular webinars and training
          resources to help you get the most out of our platform.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

