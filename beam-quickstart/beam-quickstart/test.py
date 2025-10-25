import requests
import json
import base64
import sys


# url -X POST 'https://deepseek-ocr-v2-81e34a3-v1.app.beam.cloud' \
# -H 'Connection: keep-alive' \
# -H 'Content-Type: application/json' \
# -H 'Authorization: Bearer dP0jk8STHqWp2jQlBcobQAEKVi0rC6snPLP1a1WFEI_pIM3qzTTNY6YVp1o-CVUctJYC5oOTBIER5hxszxhNBA==' \
# -d '{}'
# OpenAI-compatible DeepSeek OCR endpoint
url = "https://deepseek-ocr-v2-81e34a3-v4.app.beam.cloud/v1/chat/completions"
token = "dP0jk8STHqWp2jQlBcobQAEKVi0rC6snPLP1a1WFEI_pIM3qzTTNY6YVp1o-CVUctJYC5oOTBIER5hxszxhNBA=="

# Read and encode image
image_path = sys.argv[1] if len(sys.argv) > 1 else "test.png"

try:
    with open(image_path, "rb") as image_file:
        image_data = base64.b64encode(image_file.read()).decode('utf-8')

    # Determine MIME type from extension
    ext = image_path.lower().split('.')[-1]
    mime_type = f"image/{ext}" if ext in ['png', 'jpg', 'jpeg', 'gif', 'webp'] else "application/pdf"
    data_url = f"data:{mime_type};base64,{image_data}"

except FileNotFoundError:
    print(f"Error: File '{image_path}' not found")
    print("Usage: python test.py <image_path>")
    sys.exit(1)

# OpenAI-compatible payload
payload = {
    "model": "deepseek-ai/DeepSeek-OCR",
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": data_url
                    }
                },
                {
                    "type": "text",
                    "text": "Extract all text from this image."
                }
            ]
        }
    ]
}

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

print(f"Processing: {image_path}")
print(f"Sending request to: {url}")

response = requests.post(url, headers=headers, data=json.dumps(payload))

print(f"\nStatus: {response.status_code}")

if response.status_code == 200:
    result = response.json()
    extracted_text = result['choices'][0]['message']['content']
    print("\n=== Extracted Text ===")
    print(extracted_text)
else:
    print(f"Error: {response.text}")