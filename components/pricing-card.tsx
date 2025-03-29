import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

interface PricingCardProps {
  title: string
  price: string
  description: string
  features: string[]
  buttonText: string
  popular?: boolean
  color: "blue" | "indigo" | "purple"
}

export default function PricingCard({
  title,
  price,
  description,
  features,
  buttonText,
  popular = false,
  color,
}: PricingCardProps) {
  const colorClasses = {
    blue: {
      badge: "bg-blue-100 text-blue-700",
      button: "bg-blue-600 hover:bg-blue-700",
      border: "border-blue-200 hover:border-blue-300",
      check: "text-blue-600",
      shadow: "shadow-blue-200/50",
    },
    indigo: {
      badge: "bg-indigo-100 text-indigo-700",
      button: "bg-indigo-600 hover:bg-indigo-700",
      border: "border-indigo-200 hover:border-indigo-300",
      check: "text-indigo-600",
      shadow: "shadow-indigo-200/50",
    },
    purple: {
      badge: "bg-purple-100 text-purple-700",
      button: "bg-purple-600 hover:bg-purple-700",
      border: "border-purple-200 hover:border-purple-300",
      check: "text-purple-600",
      shadow: "shadow-purple-200/50",
    },
  }

  const classes = colorClasses[color]

  return (
    <Card
      className={`border-2 ${classes.border} transition-all ${popular ? `shadow-xl ${classes.shadow} scale-105` : "hover:shadow-lg hover:-translate-y-1"} duration-300 relative`}
    >
      {popular && (
        <div
          className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${classes.badge} px-4 py-1 rounded-full text-sm font-medium`}
        >
          Most Popular
        </div>
      )}
      <CardHeader className="pb-2 pt-6">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <div className="flex items-end gap-1 mt-2">
          <span className="text-4xl font-bold">{price}</span>
          {price !== "Custom" && <span className="text-slate-600">/month</span>}
        </div>
        <p className="text-slate-600 mt-2">{description}</p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 mt-4 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className={`h-5 w-5 ${classes.check} mt-0.5 flex-shrink-0`} />
              <span className="text-slate-700">{feature}</span>
            </li>
          ))}
        </ul>
        <Button className={`w-full ${classes.button} text-white rounded-full`}>{buttonText}</Button>
      </CardContent>
    </Card>
  )
}

