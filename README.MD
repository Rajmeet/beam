# Whiteboard to Markdown

Transforms whiteboard images into markdown using Docling's Vision Language Model (VLM) pipeline hosted on Beam.

![Demo](demo.gif)

## Architecture

- **Frontend**: Next.js application with TypeScript and Tailwind CSS
- **Backend**: Beam endpoint with CUDA-optimized Docling VLM pipeline
- **Model**: SmolDocling Transformers for document understanding

## Features

- Upload images (JPG, PNG)
- Convert documents to structured markdown
- Real-time conversion with progress indicators
- Copy-to-clipboard functionality
- Responsive design with modern UI

## Quick Start

### Backend (Beam)

```bash
cd beam-quickstart
pip install -r requirements.txt
beam deploy app.py
```

### Frontend (Next.js)

```bash
cd web
bun install
bun dev
```

## Requirements

- Python 3.11+
- Node.js 18+
- Bun (recommended) or npm

## API

The backend exposes a single endpoint:

- **POST** `/convert` - Convert image to markdown
  - Input: Base64-encoded image data
  - Output: Markdown content

## Development

The application uses:
- **Docling**: Document processing and VLM pipeline
- **Beam**: Serverless GPU deployment
- **Next.js**: React framework with App Router
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives

## Future Improvements

- **Better Model**: Upgrade to LLaVA-1.6, Qwen-VL, or BLIP-2 for superior diagram and text recognition 
- **LLM Integration**: Use language models to understand complex relationships in mind maps, flowcharts and diagrams
- **Convert to Digital Whiteboard**: Image to Digital Whiteboard (something like Excalidraw)

