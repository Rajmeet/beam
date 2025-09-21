import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Eye, Code2, FileText } from "lucide-react"

interface MarkdownOutputProps {
  markdownOutput: string
  viewMode: 'raw' | 'preview'
  onViewModeChange: (mode: 'raw' | 'preview') => void
  onCopy: () => void
}

export function MarkdownOutput({ 
  markdownOutput, 
  viewMode, 
  onViewModeChange, 
  onCopy 
}: MarkdownOutputProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <label className="block text-sm font-semibold text-gray-900">Generated Markdown:</label>
        {markdownOutput && (
          <div className="flex items-center space-x-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'preview' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('preview')}
                className="h-8 px-3"
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              <Button
                variant={viewMode === 'raw' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('raw')}
                className="h-8 px-3"
              >
                <Code2 className="h-4 w-4 mr-1" />
                Raw
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onCopy}
              className="bg-white/90 backdrop-blur-xs flex items-center space-x-2"
            >
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </Button>
          </div>
        )}
      </div>
      
      {markdownOutput ? (
        <div className="relative">
          {viewMode === 'preview' ? (
            <div className="min-h-[400px] border border-gray-200 bg-white rounded-xl p-6 overflow-y-auto text-sm leading-relaxed">
              <div className="whitespace-pre-wrap text-gray-700">{markdownOutput}</div>
            </div>
          ) : (
            <Textarea
              value={markdownOutput}
              readOnly
              className="min-h-[400px] resize-none border-gray-200 bg-gray-50 font-mono text-sm rounded-xl p-4"
            />
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-[400px] border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <div className="text-center text-gray-400">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <p className="text-lg font-medium mb-2">Markdown will appear here</p>
            <p className="text-sm">Upload a whiteboard photo and click convert</p>
          </div>
        </div>
      )}
    </div>
  )
}
