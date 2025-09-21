import { NextRequest, NextResponse } from 'next/server'

// Your deployed Beam Cloud service URL with GPU
const BEAM_SERVICE_URL = process.env.BEAM_SERVICE_URL || 'https://58c4d29f-fedb-4130-b9f4-197d7c12f9b6.app.beam.cloud'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert file to base64 data URL
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // Send to Beam service with base64 data
    const response = await fetch(BEAM_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BEAM_TOKEN || 'dP0jk8STHqWp2jQlBcobQAEKVi0rC6snPLP1a1WFEI_pIM3qzTTNY6YVp1o-CVUctJYC5oOTBIER5hxszxhNBA=='}`,
      },
      body: JSON.stringify({ image: dataUrl }),
    })

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
      imageUrl: dataUrl,
    })
  } catch (error) {
    console.error('Conversion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
