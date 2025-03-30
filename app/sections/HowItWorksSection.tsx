import ProcessFlow from "@/components/process-flow"
import SectionHeading from "@/components/section-heading"
import SectionContainer from "@/components/section-container"

export default function HowItWorksSection() {
  return (
    <SectionContainer id="how-it-works">
      <SectionHeading 
        badge="Process"
        title="How PIP Assistant Works"
        description="A simple, streamlined process to manage performance improvement"
      />
      <ProcessFlow />
    </SectionContainer>
  )
} 