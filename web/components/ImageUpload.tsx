import { Button } from "@/components/ui/button"
import { PenTool, Loader2 } from "lucide-react"

interface ImageUploadProps {
  uploadedImage: string | null
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onConvert: () => void
  isLoading: boolean
  fileInputRef: React.RefObject<HTMLInputElement>
  setUploadedImage: (image: string | null) => void
}

export function ImageUpload({ 
  uploadedImage, 
  onImageUpload, 
  onConvert, 
  isLoading, 
  fileInputRef,
  setUploadedImage
}: ImageUploadProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-4">Whiteboard Image:</label>

      {uploadedImage ? (
        <div className="space-y-4">
          <div className="relative h-[400px] overflow-hidden">
            <img
              src={uploadedImage}
              alt="Uploaded document"
              className="w-full h-full object-cover rounded-xl border border-gray-200 shadow-xs"
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
            onClick={onConvert} 
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
          className="border-2 border-dashed border-gray-300 rounded-xl p-16 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 group h-[400px] flex items-center justify-center"
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

      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*,.pdf,.docx,.pptx" 
        onChange={onImageUpload} 
        className="hidden" 
      />
      
      {!uploadedImage && (
        <div className="mt-4 text-center">
          <button 
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            onClick={() => {
              // Load the sample image
              const img = new Image()
              img.onload = () => {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')!
                canvas.width = img.width
                canvas.height = img.height
                ctx.drawImage(img, 0, 0)
                canvas.toBlob((blob) => {
                  if (blob) {
                    const file = new File([blob], 'sample-whiteboard.png', { type: 'image/png' })
                    const reader = new FileReader()
                    reader.onload = (e) => {
                      setUploadedImage(e.target?.result as string)
                    }
                    reader.readAsDataURL(file)
                  }
                })
              }
              img.src = '/photo.png'
            }}
          >
            Don't have an image? Take ours!
          </button>
        </div>
      )}
    </div>
  )
}
