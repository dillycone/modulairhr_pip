import Image from "next/image"

export default function IntegrationLogos() {
  const logos = [
    { name: "Slack", src: "/placeholder.svg?height=40&width=120" },
    { name: "Microsoft Teams", src: "/placeholder.svg?height=40&width=120" },
    { name: "Microsoft 365", src: "/placeholder.svg?height=40&width=120" },
    { name: "Salesforce", src: "/placeholder.svg?height=40&width=120" },
    { name: "Workday", src: "/placeholder.svg?height=40&width=120" },
    { name: "Zoom", src: "/placeholder.svg?height=40&width=120" },
  ]

  return (
    <div className="flex flex-wrap justify-center gap-8 md:gap-12">
      {logos.map((logo, index) => (
        <div
          key={index}
          className="grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300"
        >
          <Image src={logo.src || "/placeholder.svg"} alt={logo.name} width={120} height={40} className="h-10 object-contain" />
        </div>
      ))}
    </div>
  )
}

