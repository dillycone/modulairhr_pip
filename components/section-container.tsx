import { ReactNode } from "react"

interface SectionContainerProps {
  children: ReactNode
  className?: string
  id?: string
  bgColor?: "white" | "gradient" | "slate"
}

export default function SectionContainer({
  children,
  className = "",
  id,
  bgColor = "white",
}: SectionContainerProps) {
  // Determine background class based on bgColor prop
  let bgClass = ""
  
  switch (bgColor) {
    case "white":
      bgClass = "bg-white"
      break
    case "gradient":
      bgClass = "bg-gradient-to-br from-indigo-50 via-blue-50 to-white relative"
      break
    case "slate":
      bgClass = "bg-slate-50"
      break
    default:
      bgClass = "bg-white"
  }

  return (
    <section 
      className={`w-full py-16 md:py-24 ${bgClass} ${className}`}
      id={id}
    >
      <div className="container px-4 md:px-6 relative">
        {bgColor === "gradient" && (
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.2] pointer-events-none"></div>
        )}
        {children}
      </div>
    </section>
  )
} 