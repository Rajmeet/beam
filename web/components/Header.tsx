import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"
import Image from "next/image"

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur-xs">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3">
              <span className="text-xl font-semibold text-gray-900">Powered by</span>
            </div>
            <Image 
                src="/beam.svg" 
                alt="Beam" 
                width={79} 
                height={21}
                className="h-6 w-auto"
              />
          </div>
          <Button variant="outline" size="sm" className="flex items-center space-x-2" asChild>
            <a href="https://github.com/Rajmeet/beam" target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4" />
              <span>Repo</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
