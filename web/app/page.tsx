"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload } from "lucide-react"

export default function WhiteboardToMarkdown() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState("")
  const [markdownOutput, setMarkdownOutput] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const convertToMarkdown = () => {
    if (!extractedText.trim()) return

    const markdown = extractedText
      .split("\n")
      .map((line) => {
        const trimmed = line.trim()
        if (!trimmed) return ""

        // Convert bullet points
        if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
          return `- ${trimmed.substring(1).trim()}`
        }

        // Convert numbered lists
        if (/^\d+\./.test(trimmed)) {
          return trimmed
        }

        // Convert headers
        if (trimmed === trimmed.toUpperCase() && trimmed.length > 3) {
          return `## ${trimmed}`
        }

        if (trimmed.endsWith(":") && !trimmed.includes(" ")) {
          return `### ${trimmed.slice(0, -1)}`
        }

        return trimmed
      })
      .join("\n")

    setMarkdownOutput(markdown)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdownOutput)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-medium text-black mb-2">Whiteboard to Markdown</h1>
          <p className="text-gray-600">Upload an image to turn it into structured markdown</p>
        </div>

        <div className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-black mb-3">Image:</label>

            {uploadedImage ? (
              <div className="space-y-4">
                <img
                  src={uploadedImage || "/placeholder.svg"}
                  alt="Uploaded whiteboard"
                  className="w-full rounded-lg border border-gray-200"
                />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                  Upload different image
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Upload an image</p>
                <p className="text-sm text-gray-400">or drag and drop</p>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-3">Text Content:</label>
            <Textarea
              placeholder="Enter the text content from your whiteboard..."
              value={extractedText}
              onChange={(e) => {
                setExtractedText(e.target.value)
                // Auto-convert as user types
                if (e.target.value.trim()) {
                  const markdown = e.target.value
                    .split("\n")
                    .map((line) => {
                      const trimmed = line.trim()
                      if (!trimmed) return ""
                      if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
                        return `- ${trimmed.substring(1).trim()}`
                      }
                      if (/^\d+\./.test(trimmed)) return trimmed
                      if (trimmed === trimmed.toUpperCase() && trimmed.length > 3) {
                        return `## ${trimmed}`
                      }
                      if (trimmed.endsWith(":") && !trimmed.includes(" ")) {
                        return `### ${trimmed.slice(0, -1)}`
                      }
                      return trimmed
                    })
                    .join("\n")
                  setMarkdownOutput(markdown)
                }
              }}
              className="min-h-[120px] resize-none border-gray-200 focus:border-black focus:ring-0"
            />
          </div>

          {markdownOutput && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-black">Markdown:</label>
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="text-xs bg-transparent">
                  Copy
                </Button>
              </div>
              <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm font-mono overflow-auto max-h-64 whitespace-pre-wrap">
                {markdownOutput}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
