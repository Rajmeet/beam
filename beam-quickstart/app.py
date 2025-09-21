from beam import endpoint, Image
import json
import io
import base64
import time
import os
from typing import Dict, Any


def load_docling_model():
    """Load the DocumentConverter with VLM pipeline once at startup"""
    from docling.document_converter import DocumentConverter
    from docling.datamodel.base_models import InputFormat
    from docling.document_converter import PdfFormatOption, ImageFormatOption
    from docling.pipeline.vlm_pipeline import VlmPipeline
    from docling.datamodel.pipeline_options import VlmPipelineOptions
    from docling.datamodel import vlm_model_specs

    vlm_options = VlmPipelineOptions(
        vlm_options=vlm_model_specs.SMOLDOCLING_TRANSFORMERS
    )
    
    return DocumentConverter(
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


converter = None
try:
    converter = load_docling_model()
except Exception:
    pass


@endpoint(
    image=Image(
        python_version="python3.11",
        base_image="nvidia/cuda:12.1.1-cudnn8-runtime-ubuntu22.04"
    ).add_python_packages([
        "torch",
        "torchvision", 
        "torchaudio",
        "docling",
        "transformers",
        "requests",
        "python-multipart",
    ]),
    on_start=load_docling_model,
    gpu="A10G",
    cpu=4,
    memory="16Gi"
)
def convert(context, request=None, **kwargs) -> Dict[str, Any]:
    """Convert images to markdown using Docling VLM pipeline"""
    global converter
    
    # Get converter from context or fallback to global
    if hasattr(context, 'on_start_value') and context.on_start_value:
        converter = context.on_start_value
    elif converter is None:
        converter = load_docling_model()
    
    # CUDA optimizations
    import torch
    os.environ['PYTORCH_CUDA_ALLOC_CONF'] = 'expandable_segments:True'
    os.environ['TOKENIZERS_PARALLELISM'] = 'false'
    torch.backends.cuda.matmul.allow_tf32 = True
    torch.backends.cudnn.allow_tf32 = True
    
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
    
    try:
        import logging
        logger = logging.getLogger(__name__)
        
        # Handle base64 image only
        image_data = kwargs.get("image")
        if not image_data or not image_data.startswith('data:'):
            logger.error("No valid image data provided")
            return {"error": "No valid image data provided"}
        
        # Process base64 image
        header, encoded = image_data.split(',', 1)
        content = base64.b64decode(encoded)
        buf = io.BytesIO(content)
        filename = "document.pdf" if 'pdf' in header else "image.jpg"
        logger.info(f"Processing {filename}, size: {len(content)} bytes")
        
        # Create DocumentStream and convert
        from docling.datamodel.base_models import DocumentStream
        source = DocumentStream(name=filename, stream=buf)
        
        result = converter.convert(source)
        markdown_content = result.document.export_to_markdown()
        
        return {
            "success": True,
            "markdown": markdown_content
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }