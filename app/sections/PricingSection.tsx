import PricingCard from "@/components/pricing-card"
import { Badge } from "@/components/ui/badge"

export default function PricingSection() {
  return (
    <section className="w-full py-16 md:py-24 bg-white" id="pricing">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors">Pricing</Badge>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-slate-900">
              Simple, Transparent Pricing
            </h2>
            <p className="max-w-[700px] text-slate-600 md:text-xl">
              Choose the plan that works best for your organization
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <PricingCard
            title="Starter"
            price="$99"
            description="Perfect for small teams just getting started with performance management"
            features={[
              "Up to 25 employees",
              "5 admin users",
              "Basic template library",
              "Standard reporting",
              "Email support",
            ]}
            buttonText="Start Free Trial"
            popular={false}
            color="blue"
          />
          <PricingCard
            title="Professional"
            price="$249"
            description="Ideal for growing organizations with more complex needs"
            features={[
              "Up to 100 employees",
              "15 admin users",
              "Advanced template library",
              "Custom reporting",
              "Priority support",
              "API access",
            ]}
            buttonText="Start Free Trial"
            popular={true}
            color="indigo"
          />
          <PricingCard
            title="Enterprise"
            price="Custom"
            description="Tailored solutions for large organizations with specific requirements"
            features={[
              "Unlimited employees",
              "Unlimited admin users",
              "Custom templates",
              "Advanced analytics",
              "Dedicated account manager",
              "SSO integration",
              "Custom implementation",
            ]}
            buttonText="Contact Sales"
            popular={false}
            color="purple"
          />
        </div>
      </div>
    </section>
  )
} 