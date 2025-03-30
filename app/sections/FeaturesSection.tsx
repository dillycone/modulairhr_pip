import FeatureCard from "@/components/feature-card"
import SectionHeading from "@/components/section-heading"
import SectionContainer from "@/components/section-container"

export default function FeaturesSection() {
  return (
    <SectionContainer id="features">
      <SectionHeading 
        badge="Features"
        title="Everything You Need for Effective PIPs"
        description="Our comprehensive platform streamlines the entire performance improvement process"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        <FeatureCard
          title="AI-Powered Plan Generation"
          description="Create customized PIPs in minutes with our template library and AI-assisted content generation."
          icon="FileText"
          gradient="from-blue-400 to-blue-600"
          expertiseNote="You provide the judgment, we handle the paperwork"
        />
        <FeatureCard
          title="Real-Time Progress Tracking"
          description="Monitor employee progress with real-time updates, milestones, and completion metrics."
          icon="LineChart"
          gradient="from-indigo-400 to-indigo-600"
          expertiseNote="Your insights, backed by comprehensive data"
        />
        <FeatureCard
          title="Comprehensive Reporting"
          description="Generate detailed reports on individual and team performance with exportable formats."
          icon="BarChart"
          gradient="from-blue-400 to-indigo-600"
          expertiseNote="Turn your expertise into actionable insights"
        />
        <FeatureCard
          title="Collaborative Workflow"
          description="Enable seamless collaboration between HR, managers, and employees with role-based permissions."
          icon="Users"
          gradient="from-indigo-400 to-blue-600"
          expertiseNote="Facilitate better conversations, not replace them"
        />
        <FeatureCard
          title="Compliance Management"
          description="Ensure all PIPs meet legal and organizational requirements with built-in compliance checks."
          icon="ShieldCheck"
          gradient="from-blue-500 to-indigo-500"
          expertiseNote="Your legal knowledge, consistently applied"
        />
        <FeatureCard
          title="Integration Capabilities"
          description="Connect with your existing HR systems, calendar, and communication tools."
          icon="Link"
          gradient="from-indigo-500 to-blue-500"
          expertiseNote="Works with your processes, not against them"
        />
      </div>
    </SectionContainer>
  )
} 