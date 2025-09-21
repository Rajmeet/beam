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
  if (!rawMarkdown || typeof rawMarkdown !== 'string') {
    return ''
  }

  let formatted = rawMarkdown
    // Remove HTML comments (like <!-- image -->)
    .replace(/<!--[\s\S]*?-->/g, '')
    // Fix HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

  // Ensure we preserve line breaks by converting \n to proper markdown line breaks
  formatted = formatted.replace(/\n/g, '\n\n')

  // Try to detect if this is structured content that needs better formatting
  const hasStructure = /[#*\-+]\s/.test(formatted) || /\d+\.\s/.test(formatted)
  
  if (!hasStructure) {
    // If no markdown structure detected, try to add some basic formatting
    formatted = addBasicFormatting(formatted)
  }

  return formatted
    .replace(/\n{4,}/g, '\n\n') // Remove excessive line breaks (more than 2)
    .replace(/^#+\s*$/gm, '') // Remove empty headers
    .replace(/^\s*[-*]\s*$/gm, '') // Remove empty list items
    .trim()
}

// Helper function to add basic formatting to unstructured text
const addBasicFormatting = (text: string): string => {
  let formatted = text
  
  // Clean up the repetitive dots at the end
  formatted = formatted.replace(/·+\s*$/, '')
  
  // Group related content together
  formatted = formatted.replace(/(\d+)\s*Sections?\s*(CSE\d+)/g, '- $1 Section$3')
  formatted = formatted.replace(/(CSE\d+)/g, '- $1')
  formatted = formatted.replace(/(\d+)\s*emails/g, '- $1 emails')
  formatted = formatted.replace(/(\d+)\s*Sales Calls/g, '- $1 Sales Calls')
  formatted = formatted.replace(/(\d+)\s*Bootcamps/g, '- $1 Bootcamps')
  formatted = formatted.replace(/(\d+)\s*Pitch Competions/g, '- $1 Pitch Competitions')
  formatted = formatted.replace(/(\d+)\s*Internships/g, '- $1 Internships')
  formatted = formatted.replace(/(\d+)\s*Exam Reviews/g, '- $1 Exam Reviews')
  
  // Format dates as headers
  formatted = formatted.replace(/([A-Z][a-z]+ \d{1,2}[a-z]*)/g, '\n## $1')
  formatted = formatted.replace(/(\d{1,2}\/\d{1,2}-\d{1,2})/g, '\n## $1')
  formatted = formatted.replace(/(Oct \d{1,2}- Oct \d{1,2})/g, '\n## $1')
  formatted = formatted.replace(/(Nov \d{1,2} - Nov\/\d{1,2})/g, '\n## $1')
  
  // Clean up excessive line breaks and dots
  formatted = formatted.replace(/\n{3,}/g, '\n\n')
  formatted = formatted.replace(/·+/g, '')
  
  return formatted
}
