import IntegrationLogos from "@/components/integration-logos"

export default function IntegrationsSection() {
  return (
    <section className="w-full py-12 bg-slate-50">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-8">
          <p className="text-slate-600 text-sm uppercase tracking-wider font-medium">
            Integrates with your favorite tools
          </p>
        </div>
        <IntegrationLogos />
      </div>
    </section>
  )
} 