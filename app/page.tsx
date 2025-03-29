import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight } from "lucide-react"
import FeatureCard from "@/components/feature-card"
import TestimonialCard from "@/components/testimonial-card"
import PricingCard from "@/components/pricing-card"
import FaqAccordion from "@/components/faq-accordion"
import ProcessFlow from "@/components/process-flow"
import StatsCounter from "@/components/stats-counter"
import IntegrationLogos from "@/components/integration-logos"
import { Badge } from "@/components/ui/badge"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-indigo-50 via-blue-50 to-white overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.2] pointer-events-none"></div>
        <div className="container px-4 md:px-6 relative">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <Badge className="w-fit bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors">
                Streamline HR Processes
              </Badge>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
                  Accelerate Performance Improvement Plans
                </h1>
                <p className="max-w-[600px] text-slate-700 md:text-xl">
                  <span className="font-semibold text-indigo-700">Your expertise, scaled.</span> Create, track, and
                  manage PIPs with our intuitive platform designed to amplify HR professionals and managers, not replace
                  them.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8">
                  Request a Demo
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-full px-8"
                >
                  Watch Video <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-indigo-600" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-indigo-600" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[600px] aspect-video rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-blue-500/10 z-10"></div>
                <img
                  src="/placeholder.svg?height=600&width=1000"
                  alt="PIP Assistant Dashboard Preview"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-12 bg-white border-y border-slate-100">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatsCounter value={500} label="Companies" suffix="+" />
            <StatsCounter value={10000} label="PIPs Created" suffix="+" />
            <StatsCounter value={98} label="Satisfaction Rate" suffix="%" />
            <StatsCounter value={40} label="Time Saved" suffix="%" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 md:py-24 bg-white" id="features">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors">Features</Badge>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-slate-900">
                Everything You Need for Effective PIPs
              </h2>
              <p className="max-w-[700px] text-slate-600 md:text-xl">
                Our comprehensive platform streamlines the entire performance improvement process
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <FeatureCard
              title="AI-Powered Plan Generation"
              description="Create customized PIPs in minutes with our template library and AI-assisted content generation."
              icon="FileText"
              gradient="from-blue-500 to-indigo-600"
              expertiseNote="You provide the judgment, we handle the paperwork"
            />
            <FeatureCard
              title="Real-Time Progress Tracking"
              description="Monitor employee progress with real-time updates, milestones, and completion metrics."
              icon="LineChart"
              gradient="from-indigo-500 to-purple-600"
              expertiseNote="Your insights, backed by comprehensive data"
            />
            <FeatureCard
              title="Comprehensive Reporting"
              description="Generate detailed reports on individual and team performance with exportable formats."
              icon="BarChart"
              gradient="from-purple-500 to-pink-600"
              expertiseNote="Turn your expertise into actionable insights"
            />
            <FeatureCard
              title="Collaborative Workflow"
              description="Enable seamless collaboration between HR, managers, and employees with role-based permissions."
              icon="Users"
              gradient="from-pink-500 to-red-600"
              expertiseNote="Facilitate better conversations, not replace them"
            />
            <FeatureCard
              title="Compliance Management"
              description="Ensure all PIPs meet legal and organizational requirements with built-in compliance checks."
              icon="ShieldCheck"
              gradient="from-amber-500 to-orange-600"
              expertiseNote="Your legal knowledge, consistently applied"
            />
            <FeatureCard
              title="Integration Capabilities"
              description="Connect with your existing HR systems, calendar, and communication tools."
              icon="Link"
              gradient="from-emerald-500 to-green-600"
              expertiseNote="Works with your processes, not against them"
            />
          </div>
        </div>
      </section>

      {/* HR Expertise Section */}
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

      {/* Integration Logos */}
      <section className="w-full py-12 bg-slate-50">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-8">
            <p className="text-slate-600 text-sm uppercase tracking-wider font-medium">
              Integrates with your favorite tools
            </p>
          </div>
          <IntegrationLogos />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-16 md:py-24 bg-white" id="how-it-works">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors">Process</Badge>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-slate-900">
                How PIP Assistant Works
              </h2>
              <p className="max-w-[700px] text-slate-600 md:text-xl">
                A simple, streamlined process to manage performance improvement
              </p>
            </div>
          </div>
          <ProcessFlow />
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        className="w-full py-16 md:py-24 bg-gradient-to-br from-indigo-50 via-blue-50 to-white relative"
        id="testimonials"
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.2] pointer-events-none"></div>
        <div className="container px-4 md:px-6 relative">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors">Testimonials</Badge>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-slate-900">
                Trusted by HR Leaders
              </h2>
              <p className="max-w-[700px] text-slate-600 md:text-xl">
                See what our customers have to say about PIP Assistant
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <TestimonialCard
              quote="PIP Assistant has transformed how we handle performance improvement. It doesn't replace our expertise—it scales it. What used to take hours now takes minutes, letting us focus on meaningful employee conversations."
              author="Sarah Johnson"
              role="HR Director, TechCorp"
              rating={5}
              image="/placeholder.svg?height=100&width=100"
            />
            <TestimonialCard
              quote="As a manager, I needed a tool that would help me create fair and effective PIPs. PIP Assistant not only streamlined the process but provided valuable guidance while letting me apply my own expertise."
              author="Michael Chen"
              role="Team Lead, Innovate Inc."
              rating={5}
              image="/placeholder.svg?height=100&width=100"
            />
            <TestimonialCard
              quote="The reporting capabilities alone are worth the investment. We can now track progress across departments and identify trends that help us improve our overall performance management while maintaining our personal touch."
              author="Jessica Williams"
              role="VP of Human Resources, Global Solutions"
              rating={5}
              image="/placeholder.svg?height=100&width=100"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
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

      {/* FAQ Section */}
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
          <div className="max-w-3xl mx-auto mt-12">
            <FaqAccordion />
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
    </div>
  )
}

