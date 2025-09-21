import { useState, useRef } from "react"
import { compressImage, formatMarkdown } from "@/lib/image-utils"
import { useImageConversion } from "./useImageConversion"
import { toast } from "sonner"

export function useImageConverter() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [markdownOutput, setMarkdownOutput] = useState("")
  const [viewMode, setViewMode] = useState<'raw' | 'preview'>('preview')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const conversionMutation = useImageConversion()

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        setMarkdownOutput("")
      }
      reader.readAsDataURL(file)
    }
  }

  const convertImageToMarkdown = async () => {
    if (!uploadedImage) return

    try {
      // Convert base64 to file and compress it
      const response = await fetch(uploadedImage)
      const blob = await response.blob()
      
      // Compress image before sending
      const compressedFile = await compressImage(blob, 'document.jpg')

      // Use React Query mutation
      const result = await conversionMutation.mutateAsync(compressedFile)
      
      if (result.success) {
        const formattedMarkdown = formatMarkdown(result.markdown)
        setMarkdownOutput(formattedMarkdown)
      }
    } catch (err) {
      console.error("Conversion error:", err)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdownOutput)
    toast.success("Markdown copied to clipboard!")
  }

  return {
    uploadedImage,
    markdownOutput,
    isLoading: conversionMutation.isPending,
    error: conversionMutation.error?.message || "",
    viewMode,
    fileInputRef,
    handleImageUpload,
    convertImageToMarkdown,
    copyToClipboard,
    setViewMode,
    setError: () => conversionMutation.reset()
  }
}
