"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Loader2 } from "lucide-react"

export default function DoclingVLMConverter() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [markdownOutput, setMarkdownOutput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
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
      // Convert base64 to file for upload
      const response = await fetch(uploadedImage)
      const blob = await response.blob()
      const file = new File([blob], 'document.jpg', { type: 'image/jpeg' })

      // Create FormData
      const formData = new FormData()
      formData.append('file', file)

      const apiResponse = await fetch('/api/convert', {
        method: 'POST',
        body: formData
      })

      const result = await apiResponse.json()

      if (result.success) {
        setMarkdownOutput(result.markdown)
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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-medium text-black mb-2">Docling VLM Converter</h1>
          <p className="text-gray-600">Upload an image to convert it to markdown using AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-black mb-3">Upload Image:</label>

              {uploadedImage ? (
                <div className="space-y-4">
                  <img
                    src={uploadedImage}
                    alt="Uploaded document"
                    className="w-full rounded-lg border border-gray-200"
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={convertImageToMarkdown} 
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Converting...
                        </>
                      ) : (
                        "Convert to Markdown"
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()} 
                      disabled={isLoading}
                    >
                      Change Image
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Upload an image</p>
                  <p className="text-sm text-gray-400">Supports PDF, images, documents</p>
                </div>
              )}

              <input ref={fileInputRef} type="file" accept="image/*,.pdf,.docx,.pptx" onChange={handleImageUpload} className="hidden" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Right Column - Output */}
          <div className="space-y-6">
            {markdownOutput ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-black">Markdown Output:</label>
                  <Button variant="outline" size="sm" onClick={copyToClipboard} className="text-xs bg-transparent">
                    Copy
                  </Button>
                </div>
                <Textarea
                  value={markdownOutput}
                  readOnly
                  className="min-h-[400px] resize-none border-gray-200 bg-gray-50 font-mono text-sm"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] border-2 border-dashed border-gray-200 rounded-lg">
                <div className="text-center text-gray-400">
                  <p className="text-lg mb-2">Markdown will appear here</p>
                  <p className="text-sm">Upload an image and click convert</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
