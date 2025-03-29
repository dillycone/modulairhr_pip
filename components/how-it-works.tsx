import { Card, CardContent } from "@/components/ui/card"
import { FileText, LineChart, BarChart, CheckCircle } from "lucide-react"

export default function HowItWorks() {
  return (
    <div className="mt-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <Card className="border-slate-200 transition-all hover:shadow-md">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="rounded-full bg-blue-100 p-4 mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-medium mb-2">1. Create Plan</h3>
            <p className="text-slate-600">
              Use our templates or AI-assisted tools to quickly create customized performance improvement plans.
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 transition-all hover:shadow-md">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="rounded-full bg-blue-100 p-4 mb-4">
              <LineChart className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-medium mb-2">2. Track Progress</h3>
            <p className="text-slate-600">
              Monitor employee progress with real-time updates, milestones, and completion metrics.
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 transition-all hover:shadow-md">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="rounded-full bg-blue-100 p-4 mb-4">
              <BarChart className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-medium mb-2">3. Generate Reports</h3>
            <p className="text-slate-600">
              Create comprehensive reports to document progress, identify trends, and inform decisions.
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 transition-all hover:shadow-md">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="rounded-full bg-blue-100 p-4 mb-4">
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-medium mb-2">4. Achieve Results</h3>
            <p className="text-slate-600">
              Improve employee performance and document outcomes for better organizational results.
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-12 max-w-3xl mx-auto text-center">
        <p className="text-slate-700">
          PIP Assistant streamlines the entire performance improvement process, saving HR professionals and managers
          valuable time while ensuring consistent, fair, and effective performance management.
        </p>
      </div>
    </div>
  )
}

