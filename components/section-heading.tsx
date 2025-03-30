import { Badge } from "@/components/ui/badge"

interface SectionHeadingProps {
  badge: string
  title: string
  description: string
  center?: boolean
  titleClassName?: string
}

export default function SectionHeading({
  badge,
  title,
  description,
  center = true,
  titleClassName = "text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-slate-900"
}: SectionHeadingProps) {
  return (
    <div className={`flex flex-col ${center ? 'items-center justify-center text-center' : ''} space-y-4 mb-12`}>
      <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors">
        {badge}
      </Badge>
      <div className="space-y-2">
        <h2 className={titleClassName}>
          {title}
        </h2>
        <p className="max-w-[700px] text-slate-600 md:text-xl">
          {description}
        </p>
      </div>
    </div>
  )
} 