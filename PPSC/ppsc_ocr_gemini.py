import os
import sys
import fitz  # PyMuPDF
import base64
import re
import time
import json
from google import genai
from google.genai import types

# Set standard output to UTF-8
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

folder = r"a:\Business Analyst 2025 and 2026\The_Ledger\PPSC"
pdf_path = os.path.join(folder, "paper_1_19_2019.pdf")
txt_path = os.path.join(folder, "paper_1_19_2019.txt")

# Load API key
def load_api_key():
    key_file = os.path.join(folder, "api_key.txt")
    if os.path.exists(key_file):
        with open(key_file, "r", encoding="utf-8") as f:
            lines = f.read().splitlines()
            for line in lines:
                val = line.split("=", 1)[1] if "=" in line else line
                val = val.strip().strip('"').strip("'")
                if val.startswith("AIzaSy"):
                    return val
    return None

api_key = load_api_key()
if not api_key:
    print("Error: No valid Gemini API key found in api_key.txt")
    sys.exit(1)

print("Gemini API key loaded successfully.", flush=True)

# Initialize Google GenAI Client
client = genai.Client(api_key=api_key)

# Config
BATCH_SIZE = 4  # Reduced batch size to prevent upload timeouts on slower connections
DPI = 150        # Render quality

# Safety configurations to bypass false-positive blocks
safety_config = [
    types.SafetySetting(
        category=types.HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold=types.HarmBlockThreshold.BLOCK_NONE,
    ),
    types.SafetySetting(
        category=types.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold=types.HarmBlockThreshold.BLOCK_NONE,
    ),
    types.SafetySetting(
        category=types.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold=types.HarmBlockThreshold.BLOCK_NONE,
    ),
    types.SafetySetting(
        category=types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold=types.HarmBlockThreshold.BLOCK_NONE,
    ),
]

def ocr_batch_with_sdk(image_paths_and_nums):
    contents = [
        {
            "text": (
                "You are an expert OCR transcriber. Transcribe the text from the following PPSC past paper page images exactly as written, page-by-page. "
                "For each page, start with a header formatted exactly like:\n"
                "--- Page X ---\n"
                "where X is the page number (e.g., --- Page 45 ---), followed by the transcribed text of that page.\n"
                "Do not summarize. Do not omit any questions, options, headings, footnotes, page numbers, or text. "
                "Ensure spelling and formatting are preserved. Output only the transcribed text."
            )
        }
    ]
    
    for img_path, page_num in image_paths_and_nums:
        with open(img_path, "rb") as img_file:
            img_data = img_file.read()
            img_base64 = base64.b64encode(img_data).decode("utf-8")
        
        contents.append({
            "inline_data": {
                "mime_type": "image/jpeg",
                "data": img_base64
            }
        })
        contents.append({"text": f"Above is the image of Page {page_num}."})

    # Call Gemini via SDK
    # SDK handles request construction and has robust default connection timeout managers
    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=contents,
                config=types.GenerateContentConfig(
                    temperature=0.1,
                    safety_settings=safety_config
                )
            )
            raw_text = response.text
            if not raw_text:
                raise Exception("Empty text response from Gemini API.")
            return raw_text
        except Exception as e:
            if attempt < 2:
                wait_time = 2 ** attempt
                print(f" (Request failed: {e}, retrying in {wait_time}s...)", end="", flush=True)
                time.sleep(wait_time)
                continue
            raise e

try:
    doc = fitz.open(pdf_path)
    total_pages = len(doc)
except Exception as e:
    print(f"Error opening {pdf_path}: {e}", flush=True)
    sys.exit(1)

# Determine already processed pages
processed_pages = set()
if os.path.exists(txt_path):
    with open(txt_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
        matches = re.findall(r"--- Page (\d+) ---", content)
        for m in matches:
            processed_pages.add(int(m))

print(f"Total pages = {total_pages}. Already processed = {len(processed_pages)} pages.", flush=True)

pages_to_process = [p for p in range(1, total_pages + 1) if p not in processed_pages]

if not pages_to_process:
    print("All pages are already processed.", flush=True)
    doc.close()
    sys.exit(0)

mode = "a" if os.path.exists(txt_path) and os.path.getsize(txt_path) > 0 else "w"

try:
    with open(txt_path, mode, encoding="utf-8") as out_f:
        for i in range(0, len(pages_to_process), BATCH_SIZE):
            batch = pages_to_process[i:i+BATCH_SIZE]
            print(f"Processing page range: {batch}...", flush=True)
            
            temp_images = []
            image_paths_and_nums = []
            
            # Render all pages in this batch
            for page_num in batch:
                try:
                    page = doc.load_page(page_num - 1)
                    pix = page.get_pixmap(dpi=DPI)
                    img_path = os.path.join(folder, f"temp_ppsc_page_{page_num}.jpg")
                    pix.save(img_path)
                    temp_images.append(img_path)
                    image_paths_and_nums.append((img_path, page_num))
                except Exception as e:
                    print(f"Error rendering page {page_num}: {e}", flush=True)
            
            # Send to Gemini SDK
            try:
                print("Sending batch to Gemini API...", end="", flush=True)
                batch_text = ocr_batch_with_sdk(image_paths_and_nums)
                print(" Success!", flush=True)
                
                # Write to file
                out_f.write(f"\n{batch_text.strip()}\n")
                out_f.flush()
                
                time.sleep(2)  # Short pause
            except Exception as e:
                print(f"\n[ERROR] Batch processing failed: {e}", flush=True)
                break
            finally:
                # Clean up batch temp images
                for img_path in temp_images:
                    try:
                        if os.path.exists(img_path):
                            os.remove(img_path)
                    except:
                        pass
                        
except Exception as file_e:
    print(f"Error writing to text file: {file_e}", flush=True)
finally:
    try:
        doc.close()
    except:
        pass

print("\nFinished OCR processing pass!", flush=True)
