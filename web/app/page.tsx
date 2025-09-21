"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Loader2, Copy, Github, Code, Mountain, PenTool, FileText, Eye, Code2 } from "lucide-react"

// Image compression function
const compressImage = (file: Blob, filename: string): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    
    img.onload = () => {
      // Calculate new dimensions (max 1024px on longest side)
      const maxSize = 1024
      let { width, height } = img
      
      if (width > height && width > maxSize) {
        height = (height * maxSize) / width
        width = maxSize
      } else if (height > maxSize) {
        width = (width * maxSize) / height
        height = maxSize
      }
      
      canvas.width = width
      canvas.height = height
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob((blob) => {
        resolve(new File([blob!], filename, { type: 'image/jpeg' }))
      }, 'image/jpeg', 0.8) // 80% quality
    }
    
    img.src = URL.createObjectURL(file)
  })
}

// Function to clean and format markdown content
const formatMarkdown = (rawMarkdown: string): string => {
  return rawMarkdown
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
    .replace(/^#+\s*$/gm, '') // Remove empty headers
    .replace(/^\s*[-*]\s*$/gm, '') // Remove empty list items
    .replace(/&amp;/g, '&') // Fix HTML entities
    .replace(/^\s+|\s+$/gm, '') // Trim each line
    .split('\n')
    .filter(line => line.trim() !== '') // Remove empty lines
    .join('\n')
    .trim()
}

export default function DoclingVLMConverter() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [markdownOutput, setMarkdownOutput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [viewMode, setViewMode] = useState<'raw' | 'preview'>('preview')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        setError("")
        setMarkdownOutput("")
      }
      reader.readAsDataURL(file)
    }
  }

  const convertImageToMarkdown = async () => {
    if (!uploadedImage) return

    setIsLoading(true)
    setError("")
    setMarkdownOutput("")

    try {
      // Convert base64 to file and compress it
      const response = await fetch(uploadedImage)
      const blob = await response.blob()
      
      // Compress image before sending
      const compressedFile = await compressImage(blob, 'document.jpg')

      // Create FormData
      const formData = new FormData()
      formData.append('file', compressedFile)

      const apiResponse = await fetch('/api/convert', {
        method: 'POST',
        body: formData
      })

      const result = await apiResponse.json()

      if (result.success) {
        const formattedMarkdown = formatMarkdown(result.markdown)
        setMarkdownOutput(formattedMarkdown)
      } else {
        setError(result.error || "Conversion failed")
      }
    } catch (err) {
      setError("Failed to connect to conversion service")
      console.error("Conversion error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdownOutput)
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <PenTool className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-semibold text-gray-900">Whiteboard to Markdown</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <span>Made by:</span>
                <span className="font-medium">Beam Cloud</span>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Github className="h-4 w-4" />
              <span>Repo</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
            Powered by Docling VLM & Beam Cloud
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Whiteboard to Markdown</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your whiteboard notes into clean structured markdown to keep track of your work.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Input */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-4">Whiteboard Image:</label>

              {uploadedImage ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={uploadedImage}
                      alt="Uploaded document"
                      className="w-full rounded-xl border border-gray-200 shadow-xs"
                    />
                    <div className="absolute top-3 right-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => fileInputRef.current?.click()} 
                        disabled={isLoading}
                        className="bg-white/90 backdrop-blur-xs"
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                  <Button 
                    onClick={convertImageToMarkdown} 
                    disabled={isLoading}
                    className="w-full h-12 text-base font-medium"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      "Convert to Markdown"
                    )}
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl p-16 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                      <PenTool className="h-8 w-8 text-gray-400 group-hover:text-blue-500" />
                    </div>
                    <p className="text-lg font-medium text-gray-700 mb-2">Upload whiteboard photo</p>
                    <p className="text-sm text-gray-500">or drag and drop</p>
                  </div>
                </div>
              )}

              <input ref={fileInputRef} type="file" accept="image/*,.pdf,.docx,.pptx" onChange={handleImageUpload} className="hidden" />
              
              {!uploadedImage && (
                <div className="mt-4 text-center">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Need an example whiteboard? Try ours.
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Right Column - Output */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-gray-900">Generated Markdown:</label>
                {markdownOutput && (
                  <div className="flex items-center space-x-2">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <Button
                        variant={viewMode === 'preview' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('preview')}
                        className="h-8 px-3"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        variant={viewMode === 'raw' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('raw')}
                        className="h-8 px-3"
                      >
                        <Code2 className="h-4 w-4 mr-1" />
                        Raw
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={copyToClipboard}
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
          </div>
        </div>

        {/* Code Example Section */}
        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-semibold text-white">Code:</label>
            <Button variant="outline" size="sm" className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
          <div className="bg-gray-950 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-300 font-mono">
              <code>{`import { whiteboardToMarkdown } from 'beam-cloud';

const markdown = await whiteboardToMarkdown({
  image: './whiteboard-session.jpg',
  apiKey: process.env.BEAM_API_KEY
});`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
