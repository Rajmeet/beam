import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Eye, Code2, FileText } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

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
            <div className="h-[400px] max-h-[400px] border border-gray-200 bg-white rounded-xl p-6 overflow-y-auto text-sm leading-relaxed">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  table: ({children, ...props}) => (
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse border border-gray-300" {...props}>
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({children, ...props}) => (
                    <thead className="bg-gray-50" {...props}>
                      {children}
                    </thead>
                  ),
                  tbody: ({children, ...props}) => (
                    <tbody className="bg-white" {...props}>
                      {children}
                    </tbody>
                  ),
                  tr: ({children, ...props}) => (
                    <tr className="border-b border-gray-200" {...props}>
                      {children}
                    </tr>
                  ),
                  th: ({children, ...props}) => (
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900" {...props}>
                      {children}
                    </th>
                  ),
                  td: ({children, ...props}) => (
                    <td className="border border-gray-300 px-4 py-2 text-gray-700" {...props}>
                      {children}
                    </td>
                  ),
                  pre: ({children, ...props}) => (
                    <div className="overflow-x-auto">
                      <pre className="bg-gray-100 p-4 rounded-lg text-sm" {...props}>
                        {children}
                      </pre>
                    </div>
                  ),
                  code: ({children, className, ...props}) => {
                    const isInline = !className
                    return isInline ? (
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    ) : (
                      <code className="text-sm" {...props}>
                        {children}
                      </code>
                    )
                  },
                  h1: ({children, ...props}) => (
                    <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-6" {...props}>
                      {children}
                    </h1>
                  ),
                  h2: ({children, ...props}) => (
                    <h2 className="text-xl font-semibold text-gray-900 mb-3 mt-5" {...props}>
                      {children}
                    </h2>
                  ),
                  h3: ({children, ...props}) => (
                    <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4" {...props}>
                      {children}
                    </h3>
                  ),
                  ul: ({children, ...props}) => (
                    <ul className="list-disc list-outside mb-4 space-y-2 ml-4" {...props}>
                      {children}
                    </ul>
                  ),
                  ol: ({children, ...props}) => (
                    <ol className="list-decimal list-outside mb-4 space-y-2 ml-4" {...props}>
                      {children}
                    </ol>
                  ),
                  li: ({children, ...props}) => (
                    <li className="text-gray-700 leading-relaxed pl-2" {...props}>
                      {children}
                    </li>
                  ),
                  p: ({children, ...props}) => (
                    <p className="mb-3 text-gray-700 leading-relaxed" {...props}>
                      {children}
                    </p>
                  ),
                  blockquote: ({children, ...props}) => (
                    <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-4" {...props}>
                      {children}
                    </blockquote>
                  ),
                  a: ({children, ...props}) => (
                    <a className="text-blue-600 hover:text-blue-800 underline" {...props}>
                      {children}
                    </a>
                  ),
                  strong: ({children, ...props}) => (
                    <strong className="font-semibold text-gray-900" {...props}>
                      {children}
                    </strong>
                  ),
                  em: ({children, ...props}) => (
                    <em className="italic text-gray-800" {...props}>
                      {children}
                    </em>
                  )
                }}
              >
                {markdownOutput}
              </ReactMarkdown>
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
