import os
import sys
import json
import base64
import time
import re
import fitz  # PyMuPDF
from google import genai
from google.genai import types
from concurrent.futures import ThreadPoolExecutor, as_completed

folder = r"a:\Business Analyst 2025 and 2026\The_Ledger\PPSC"
pdf_path = os.path.join(folder, "paper_1_19_2019.pdf")
txt_path = os.path.join(folder, "Extracted papers in txt", "paper_1_19_2019.txt")

# Load API key (checking both environment and local file)
api_key = os.getenv("GEMINI_API_KEY_2") or os.getenv("GEMINI_API_KEY")
if not api_key:
    key_file = os.path.join(folder, "api_key.txt")
    if os.path.exists(key_file):
        with open(key_file, "r", encoding="utf-8") as f:
            lines = f.read().splitlines()
            for line in lines:
                val = line.split("=", 1)[1] if "=" in line else line
                val = val.strip().strip('"').strip("'")
                if val and not val.startswith("#") and len(val) > 10:
                    api_key = val
                    break

if not api_key:
    print("Error: No Gemini API key found. Please paste your key in api_key.txt inside this folder.")
    sys.exit(1)

# Initialize Gemini Client
print("Initializing Gemini Client...", flush=True)
client = genai.Client(api_key=api_key)

try:
    doc = fitz.open(pdf_path)
    total_pages = len(doc)
    doc.close()
except Exception as e:
    print(f"Error opening PDF: {e}")
    sys.exit(1)

# Temp directory for page chunks
temp_dir = os.path.join(folder, "ocr_chunks")
os.makedirs(temp_dir, exist_ok=True)

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

CHUNK_SIZE = 5

# Identify missing chunks
batches_to_process = []
for i in range(1, total_pages + 1, CHUNK_SIZE):
    batch = list(range(i, min(i + CHUNK_SIZE, total_pages + 1)))
    chunk_file = os.path.join(temp_dir, f"chunk_{batch[0]}_{batch[-1]}.txt")
    if os.path.exists(chunk_file) and os.path.getsize(chunk_file) > 0:
        continue
    batches_to_process.append(batch)

def process_chunk(batch, pdf_path, client, safety_config, temp_dir):
    start_page = batch[0]
    end_page = batch[-1]
    chunk_file = os.path.join(temp_dir, f"chunk_{start_page}_{end_page}.txt")
    
    retries = 5
    base_wait = 2
    for attempt in range(retries):
        try:
            # Open PDF for this specific thread to ensure thread-safety
            doc = fitz.open(pdf_path)
            chunk_doc = fitz.open()
            for page_num in batch:
                chunk_doc.insert_pdf(doc, from_page=page_num-1, to_page=page_num-1)
                
            pdf_bytes = chunk_doc.write()
            chunk_doc.close()
            doc.close()
            
            pdf_base64 = base64.b64encode(pdf_bytes).decode("utf-8")
            
            prompt = (
                "You are an expert OCR transcriber. Transcribe the text from this PDF file exactly as written, page-by-page. "
                "Use clean Markdown formatting. Ensure that questions, options, headings, lists, and tables are preserved accurately in markdown. "
                f"This PDF contains pages {list(batch)} of the original document. "
                "For each page, start with a header formatted exactly like:\n"
                "--- Page X ---\n"
                "where X is the page number of the original document (e.g. if transcribing page 12, write --- Page 12 ---), followed by the transcribed text of that page. "
                "Do not omit any questions, options, or headings. Do not summarize. Output only the transcribed text."
            )
            
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[
                    {
                        "inline_data": {
                            "mime_type": "application/pdf",
                            "data": pdf_base64
                        }
                    },
                    {"text": prompt}
                ],
                config=types.GenerateContentConfig(
                    temperature=0.1,
                    safety_settings=safety_config
                )
            )
            
            raw_text = response.text
            if not raw_text:
                raise Exception("Empty response text.")
                
            with open(chunk_file, "w", encoding="utf-8") as f:
                f.write(f"\n{raw_text.strip()}\n")
            
            print(f"Success: Processed pages {start_page}-{end_page}", flush=True)
            return start_page, end_page, True
            
        except Exception as e:
            err_str = str(e).upper()
            is_rate_limit = "429" in err_str or "RESOURCE_EXHAUSTED" in err_str or "LIMIT" in err_str
            
            if attempt < retries - 1:
                wait_time = base_wait * (2 ** attempt)
                if is_rate_limit:
                    wait_time += 10  # Wait longer for rate limits
                    print(f"\nRate limit hit for pages {start_page}-{end_page}. Retrying in {wait_time}s...", flush=True)
                else:
                    print(f"\nError for pages {start_page}-{end_page} (Attempt {attempt+1}/{retries}): {e}. Retrying in {wait_time}s...", flush=True)
                time.sleep(wait_time)
            else:
                print(f"\n[ERROR] Failed to process pages {start_page}-{end_page} after {retries} attempts: {e}", flush=True)
                return start_page, end_page, False

# Start Parallel Processing
MAX_WORKERS = 3  # Adjust based on your API rate limits. 3 is a safe default for Gemini Flash.

if batches_to_process:
    print(f"Total pages: {total_pages}. Batches to process: {len(batches_to_process)} (using {MAX_WORKERS} workers).", flush=True)
    failures = 0
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(process_chunk, batch, pdf_path, client, safety_config, temp_dir): batch for batch in batches_to_process}
        for future in as_completed(futures):
            start, end, success = future.result()
            if not success:
                failures += 1
                
    if failures > 0:
        print(f"\nFinished with {failures} failed batches. Run the script again to retry them.", flush=True)
        sys.exit(1)
else:
    print(f"Total pages: {total_pages}. All batches are already processed!", flush=True)

# Merge chunk files into the final output file
print("\nAll chunks processed successfully! Merging into final file...", flush=True)
try:
    with open(txt_path, "w", encoding="utf-8") as out_f:
        for i in range(1, total_pages + 1, CHUNK_SIZE):
            batch = list(range(i, min(i + CHUNK_SIZE, total_pages + 1)))
            chunk_file = os.path.join(temp_dir, f"chunk_{batch[0]}_{batch[-1]}.txt")
            if os.path.exists(chunk_file):
                with open(chunk_file, "r", encoding="utf-8") as f:
                    out_f.write(f.read())
                    out_f.write("\n")
    print(f"Successfully merged all pages into: {txt_path}", flush=True)
    
    # Clean up temp directory
    for file in os.listdir(temp_dir):
        os.remove(os.path.join(temp_dir, file))
    os.rmdir(temp_dir)
    print("Cleaned up temporary chunk files.", flush=True)
    
except Exception as e:
    print(f"Error merging files or cleaning up: {e}", flush=True)

print("\nDirect PDF extraction pass finished!", flush=True)
