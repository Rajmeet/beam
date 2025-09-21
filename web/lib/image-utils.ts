// Image compression utility
export const compressImage = (file: Blob, filename: string): Promise<File> => {
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
export const formatMarkdown = (rawMarkdown: string): string => {
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
