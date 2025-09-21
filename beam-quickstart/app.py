from beam import endpoint, Image
from docling.document_converter import DocumentConverter
from docling.datamodel.base_models import InputFormat
from docling.document_converter import PdfFormatOption, ImageFormatOption
from docling.pipeline.vlm_pipeline import VlmPipeline
from docling.datamodel.pipeline_options import VlmPipelineOptions
from docling.datamodel import vlm_model_specs
import json
import io
import base64
from typing import Dict, Any

# Configure VLM pipeline with SmolDocling (lightest and fastest)
vlm_options = VlmPipelineOptions(
    vlm_options=vlm_model_specs.SMOLDOCLING_TRANSFORMERS  # Lightest working model
)

# Initialize converter with VLM pipeline for images and PDFs
converter = DocumentConverter(
    format_options={
        InputFormat.PDF: PdfFormatOption(
            pipeline_cls=VlmPipeline,
            pipeline_options=vlm_options,
        ),
        InputFormat.IMAGE: ImageFormatOption(
            pipeline_cls=VlmPipeline,
            pipeline_options=vlm_options,
        ),
    }
)

@endpoint(
    image=Image(
        python_version="python3.11",
        base_image="python:3.11",
    ).add_python_packages([
        "docling",
        "torch",
        "transformers",
        "requests",
        "python-multipart"
    ]),
    gpu="A10G",  # Use NVIDIA A10G GPU for CUDA acceleration
    cpu=4,
    memory="16Gi"
)
def convert(**kwargs) -> Dict[str, Any]:
    """
    Convert uploaded files to markdown using Docling VLM pipeline.
    
    Args:
        **kwargs: Dictionary containing:
            - file: Uploaded file object
            - image: Base64 encoded image data (optional, for backward compatibility)
    
    Returns:
        Dictionary with markdown content
    """
    import time
    import logging
    
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    start_time = time.time()
    logger.info("🚀 Starting document conversion process...")
    
    # Optimize GPU memory usage
    import torch
    import os
    
    # Set PyTorch memory optimization
    os.environ['PYTORCH_CUDA_ALLOC_CONF'] = 'expandable_segments:True'
    
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        logger.info(f"🔥 GPU available: {torch.cuda.get_device_name(0)}")
        logger.info(f"💾 GPU memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f}GB")
        logger.info(f"🆓 GPU memory free: {torch.cuda.memory_reserved(0) / 1024**3:.1f}GB reserved")
    
    try:
        # Check for file upload first, then fallback to base64
        uploaded_file = kwargs.get("file")
        image_data = kwargs.get("image")
        
        if uploaded_file:
            logger.info(f"📁 Processing uploaded file: {type(uploaded_file)}")
            
            # Handle file upload
            if hasattr(uploaded_file, 'read'):
                file_content = uploaded_file.read()
                filename = getattr(uploaded_file, 'filename', 'uploaded_file')
                content_type = getattr(uploaded_file, 'content_type', 'application/octet-stream')
                
                logger.info(f"📦 File: {filename}, Size: {len(file_content)} bytes, Type: {content_type}")
                
                # Create BytesIO stream
                buf = io.BytesIO(file_content)
                
                # Determine file format
                if content_type in ['image/jpeg', 'image/jpg']:
                    doc_filename = "image.jpg"
                elif content_type == 'image/png':
                    doc_filename = "image.png"
                elif content_type == 'application/pdf':
                    doc_filename = "document.pdf"
                else:
                    # Try to determine from filename extension
                    if filename.lower().endswith('.pdf'):
                        doc_filename = "document.pdf"
                    elif filename.lower().endswith(('.jpg', '.jpeg')):
                        doc_filename = "image.jpg"
                    elif filename.lower().endswith('.png'):
                        doc_filename = "image.png"
                    else:
                        doc_filename = filename or "document"
                
                # Create DocumentStream
                from docling.datamodel.base_models import DocumentStream
                source = DocumentStream(name=doc_filename, stream=buf)
                logger.info(f"✅ Created DocumentStream: {doc_filename}")
                
            else:
                logger.error("❌ Invalid file object - no read method")
                return {"error": "Invalid file object"}
                
        elif image_data:
            logger.info("🔍 Processing base64 encoded image...")
            
            # Handle base64 encoded image (backward compatibility)
            if image_data.startswith('data:'):
                # Extract base64 content
                header, encoded = image_data.split(',', 1)
                logger.info(f"📋 Detected header: {header}")
                
                content = base64.b64decode(encoded)
                logger.info(f"📦 Decoded image size: {len(content)} bytes")
                
                # Create BytesIO stream
                buf = io.BytesIO(content)
                
                # Determine file format from header
                if 'jpeg' in header or 'jpg' in header:
                    filename = "image.jpg"
                elif 'png' in header:
                    filename = "image.png"
                elif 'pdf' in header:
                    filename = "document.pdf"
                else:
                    filename = "image.jpg"
                
                # Create DocumentStream
                from docling.datamodel.base_models import DocumentStream
                source = DocumentStream(name=filename, stream=buf)
                logger.info(f"✅ Created DocumentStream: {filename}")
            else:
                logger.error("❌ Image must be base64 encoded with data URL format")
                return {"error": "Image must be base64 encoded with data URL format"}
        else:
            logger.error("❌ No file or image data provided")
            return {"error": "No file or image data provided"}
        
        # Convert document using VLM pipeline
        logger.info("🤖 Starting VLM conversion with SmolDocling model...")
        logger.info("⏳ This may take 20-40 seconds with GPU acceleration...")
        
        conversion_start = time.time()
        result = converter.convert(source)
        conversion_time = time.time() - conversion_start
        
        logger.info(f"✅ VLM conversion completed in {conversion_time:.2f} seconds")
        
        # Export to markdown
        logger.info("📝 Exporting to markdown...")
        markdown_content = result.document.export_to_markdown()
        logger.info(f"📄 Generated markdown: {len(markdown_content)} characters")
        
        processing_time = time.time() - start_time
        logger.info(f"🎉 Total processing time: {processing_time:.2f} seconds")
        
        return {
            "success": True,
            "markdown": markdown_content,
            "processing_time": processing_time,
            "conversion_time": conversion_time
        }
        
    except Exception as e:
        processing_time = time.time() - start_time
        logger.error(f"❌ Conversion failed after {processing_time:.2f} seconds: {str(e)}")
        logger.exception("Full error traceback:")
        return {
            "success": False,
            "error": str(e),
            "processing_time": processing_time
        }