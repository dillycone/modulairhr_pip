import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import Image from "next/image"

interface TestimonialCardProps {
  quote: string
  author: string
  role: string
  rating: number
  image: string
}

export default function TestimonialCard({ quote, author, role, rating, image }: TestimonialCardProps) {
  return (
    <Card className="border-slate-200 transition-all hover:shadow-lg hover:-translate-y-1 duration-300 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex space-x-1 mb-4">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
          ))}
        </div>
        <p className="text-slate-700 mb-6 italic">{quote}</p>
        <div className="flex items-center gap-4">
          <div className="rounded-full overflow-hidden w-12 h-12 border-2 border-indigo-100">
            <Image src={image || "/placeholder.svg"} alt={author} className="w-full h-full object-cover" width={48} height={48} />
          </div>
          <div>
            <p className="font-medium text-slate-900">{author}</p>
            <p className="text-sm text-slate-600">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

