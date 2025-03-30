import TestimonialCard from "@/components/testimonial-card"
import SectionHeading from "@/components/section-heading"
import SectionContainer from "@/components/section-container"

export default function TestimonialsSection() {
  return (
    <SectionContainer 
      id="testimonials" 
      bgColor="gradient"
    >
      <SectionHeading 
        badge="Testimonials"
        title="Trusted by HR Leaders"
        description="See what our customers have to say about PIP Assistant"
      />
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
    </SectionContainer>
  )
} 