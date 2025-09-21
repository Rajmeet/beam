import { NextRequest, NextResponse } from 'next/server'

// Your deployed Beam Cloud service URL with GPU
const BEAM_SERVICE_URL = process.env.BEAM_SERVICE_URL 

export async function POST(request: NextRequest) {
  try {
    console.log('Received request')
    const formData = await request.formData()
    const file = formData.get('file') as File

    console.log('File received:', file?.name, file?.size, file?.type)

    if (!file) {
      console.log('No file provided')
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert file to base64 and send to Beam service
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    console.log('Sending to Beam service:', BEAM_SERVICE_URL)
    
    const response = await fetch(BEAM_SERVICE_URL || '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BEAM_TOKEN}`,
      },
      body: JSON.stringify({ image: dataUrl }),
    })

    console.log('Beam service response status:', response.status)

    const result = await response.json()
    
    // Debug logging
    console.log('Beam service response:', JSON.stringify(result, null, 2))

    if (!response.ok) {
      return NextResponse.json(
        { error: result.error || 'Conversion failed' },
        { status: response.status }
      )
    }

    // Docling handles DocTags → Markdown conversion automatically
    return NextResponse.json({
      success: true,
      markdown: result.markdown,
      processing_time: result.processing_time,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    })
  } catch (error) {
    console.error('Conversion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
