"use client"

import { Header } from "@/components/Header"
import { HeroSection } from "@/components/HeroSection"
import { ImageUpload } from "@/components/ImageUpload"
import { MarkdownOutput } from "@/components/MarkdownOutput"
import { useImageConverter } from "@/hooks/useImageConverter"

export default function DoclingVLMConverter() {
  const {
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
    setUploadedImage,
    setError
  } = useImageConverter()

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <HeroSection />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Input */}
          <div className="space-y-6">
            <ImageUpload
              uploadedImage={uploadedImage}
              onImageUpload={handleImageUpload}
              onConvert={convertImageToMarkdown}
              isLoading={isLoading}
              fileInputRef={fileInputRef}
              setUploadedImage={setUploadedImage}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Right Column - Output */}
          <div className="space-y-6">
            <MarkdownOutput
              markdownOutput={markdownOutput}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onCopy={copyToClipboard}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
