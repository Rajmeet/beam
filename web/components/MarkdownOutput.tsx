import { Button } from "@/components/ui/button"
import { Copy, FileText } from "lucide-react"

interface MarkdownOutputProps {
  markdownOutput: string
  viewMode: 'raw' | 'preview'
  onViewModeChange: (mode: 'raw' | 'preview') => void
  onCopy: () => void
}

export function MarkdownOutput({
  markdownOutput,
  onCopy
}: MarkdownOutputProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <label className="block text-sm font-semibold text-gray-900">Extracted Text:</label>
        {markdownOutput && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCopy}
            className="bg-white/90 backdrop-blur-xs flex items-center space-x-2"
          >
            <Copy className="h-4 w-4" />
            <span>Copy</span>
          </Button>
        )}
      </div>

      {markdownOutput ? (
        <div className="relative">
          <div className="h-[400px] max-h-[400px] border border-gray-200 bg-white rounded-xl p-6 overflow-y-auto">
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed text-base">{markdownOutput}</pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[400px] border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <div className="text-center text-gray-400">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <p className="text-lg font-medium mb-2">Text will appear here</p>
            <p className="text-sm">Upload an image and click convert</p>
          </div>
        </div>
      )}
    </div>
  )
}