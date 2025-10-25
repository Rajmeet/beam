import { NextRequest, NextResponse } from 'next/server'

// DeepSeek OCR endpoint URL
const BEAM_SERVICE_URL = process.env.BEAM_SERVICE_URL || 'https://deepseek-ocr-67f0b65-v1.app.beam.cloud'
const BEAM_TOKEN = process.env.BEAM_TOKEN || 'dP0jk8STHqWp2jQlBcobQAEKVi0rC6snPLP1a1WFEI_pIM3qzTTNY6YVp1o-CVUctJYC5oOTBIER5hxszxhNBA=='

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

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    console.log('Sending to DeepSeek OCR:', BEAM_SERVICE_URL)

    const startTime = Date.now()

    const response = await fetch(`${BEAM_SERVICE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BEAM_TOKEN}`,
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-OCR',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: dataUrl
                }
              },
              {
                type: 'text',
                text: 'Extract all text from this image.'
              }
            ]
          }
        ]
      }),
    })

    console.log('DeepSeek OCR response status:', response.status)

    const result = await response.json()

    // Debug logging
    console.log('DeepSeek OCR response:', JSON.stringify(result, null, 2))

    if (!response.ok) {
      return NextResponse.json(
        { error: result.error || 'Conversion failed' },
        { status: response.status }
      )
    }

    const processingTime = Date.now() - startTime
    const text = result.choices?.[0]?.message?.content || ''

    return NextResponse.json({
      success: true,
      markdown: text,
      processing_time: processingTime,
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
