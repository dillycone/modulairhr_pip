import {
  FileText,
  LineChart,
  BarChart,
  Users,
  ShieldCheck,
  Link,
  Clock,
  Bell,
  Calendar,
  Settings,
  Lock,
  Download,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type IconName =
  | "FileText"
  | "LineChart"
  | "BarChart"
  | "Users"
  | "ShieldCheck"
  | "Link"
  | "Clock"
  | "Bell"
  | "Calendar"
  | "Settings"
  | "Lock"
  | "Download"

interface FeatureCardProps {
  title: string
  description: string
  icon: IconName
  gradient: string
  expertiseNote?: string
}

export default function FeatureCard({ title, description, icon, gradient, expertiseNote }: FeatureCardProps) {
  const IconComponent = {
    FileText,
    LineChart,
    BarChart,
    Users,
    ShieldCheck,
    Link,
    Clock,
    Bell,
    Calendar,
    Settings,
    Lock,
    Download,
  }[icon]

  return (
    <Card className="border-slate-200 transition-all hover:shadow-lg hover:-translate-y-1 duration-300 overflow-hidden group">
      <div className={`h-1 w-full bg-gradient-to-r ${gradient}`}></div>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`rounded-lg bg-gradient-to-r ${gradient} p-3 text-white transform group-hover:scale-110 transition-transform duration-300`}
          >
            <IconComponent className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        <p className="text-slate-600 mb-3">{description}</p>
        {expertiseNote && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-sm text-indigo-600 italic flex items-center gap-2">
              <Users className="h-3 w-3" />
              <span>{expertiseNote}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

