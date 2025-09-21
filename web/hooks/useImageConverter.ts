import { useState, useRef } from "react"
import { compressImage, formatMarkdown } from "@/lib/image-utils"

export function useImageConverter() {
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

  return {
    uploadedImage,
    markdownOutput,
    isLoading,
    error,
    viewMode,
    fileInputRef,
    handleImageUpload,
    convertImageToMarkdown,
    copyToClipboard,
    setViewMode,
    setError
  }
}
