from beam.integrations import VLLM, VLLMArgs
from beam import Image
# deepseek_ocr = VLLM(
#     name="deepseek-ocr",
#     cpu=4,
#     memory="32Gi",
#     gpu="H100",
#     gpu_count=1,
#     workers=1,
#     image=Image(
#         base_image="nvidia/cuda:11.8.0-cudnn8-devel-ubuntu22.04"
#     ).add_python_packages([
#         "transformers==4.46.3",
#         "tokenizers==0.20.3",
#         "einops",
#         "addict",
#         "easydict",
#         "Pillow",
#         "numpy",
#     ]).add_commands([
#         "pip install torch==2.6.0+cu118 torchvision==0.21.0+cu118 --index-url https://download.pytorch.org/whl/cu118",
#         "pip install -U vllm --pre --extra-index-url https://wheels.vllm.ai/nightly",
#         "pip install flash-attn==2.7.3 --no-build-isolation",
#     ]),
#     vllm_args=VLLMArgs(
#         model="deepseek-ai/DeepSeek-OCR",
#         served_model_name=["deepseek-ai/DeepSeek-OCR"],
#         trust_remote_code=True,
#         max_model_len=8192,
#         gpu_memory_utilization=0.90,
#         enable_prefix_caching=False,
#         mm_processor_kwargs={"cache_gb": 0},
#     )
# )



deepseek_ocr_v2 = VLLM(
    name="deepseek-ocr-v2", 
    cpu=4,
    memory="32Gi",
    gpu="H100", 
    gpu_count=1,
    workers=1,
    image=Image(
        base_image="vllm/vllm-openai:latest"
    ).add_commands([
        "pip install torch==2.6.0 transformers==4.46.3 tokenizers==0.20.3 einops addict easydict numpy matplotlib",
        "pip install -U --pre vllm --extra-index-url https://wheels.vllm.ai/nightly",
    ]).with_envs({  
        "MODEL_DIR": "/models",
        "PYTHONUNBUFFERED": "1",
    }),
    vllm_args=VLLMArgs(
        model="deepseek-ai/DeepSeek-OCR",
        served_model_name=["deepseek-ai/DeepSeek-OCR"],
        trust_remote_code=True,
        max_model_len=8192,
        gpu_memory_utilization=0.90,
        enable_prefix_caching=False,
        mm_processor_kwargs={"cache_gb": 0},
    )
)
