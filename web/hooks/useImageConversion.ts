import { useMutation } from '@tanstack/react-query'
import { convertImageToMarkdown, type ConversionResponse } from '@/lib/api'

export function useImageConversion() {
  return useMutation<ConversionResponse, Error, File>({
    mutationFn: convertImageToMarkdown,
    onError: (error) => {
      console.error('Conversion error:', error)
    },
  })
}
