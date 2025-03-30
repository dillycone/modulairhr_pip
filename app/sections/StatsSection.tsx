import StatsCounter from "@/components/stats-counter"

export default function StatsSection() {
  return (
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
  )
} 