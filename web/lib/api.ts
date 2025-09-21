export interface ConversionResponse {
  success: boolean
  markdown: string
  processing_time?: number
  fileName: string
  fileSize: number
  fileType: string
}

export interface ConversionError {
  error: string
}

export const convertImageToMarkdown = async (file: File): Promise<ConversionResponse> => {
  // Convert file to base64
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const base64 = buffer.toString('base64')
  const dataUrl = `data:${file.type};base64,${base64}`

  console.log('Calling Beam service:', process.env.NEXT_PUBLIC_BEAM_SERVICE_URL)
  console.log('Request payload size:', dataUrl.length)

  // Call Beam service directly
  const response = await fetch(process.env.NEXT_PUBLIC_BEAM_SERVICE_URL || '', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BEAM_TOKEN}`,
    },
    body: JSON.stringify({ image: dataUrl }),
  })

  console.log('Response status:', response.status)
  console.log('Response headers:', Object.fromEntries(response.headers.entries()))

  // Check if response is JSON
  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text()
    console.error('Non-JSON response:', text.substring(0, 500))
    throw new Error(`Expected JSON response but got ${contentType}. Response: ${text.substring(0, 200)}...`)
  }

  if (!response.ok) {
    const errorData: ConversionError = await response.json()
    throw new Error(errorData.error || 'Conversion failed')
  }

  const result = await response.json()
  
  // Extract markdown from the response
  let markdown = result.markdown || result.text || result.content || ''
  
  // If the response has a different structure, try to extract text
  if (!markdown && result.result) {
    markdown = result.result.markdown || result.result.text || result.result.content || ''
  }
  
  // If still no markdown, try to get any text content
  if (!markdown && typeof result === 'string') {
    markdown = result
  }
  
  return {
    success: true,
    markdown: markdown,
    processing_time: result.processing_time,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  }
}
