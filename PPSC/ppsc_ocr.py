import os
import sys
import fitz  # PyMuPDF
import re
import time

# Set standard output to UTF-8
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

folder = r"A:\Business Analyst 2025 and 2026\The_Ledger\PPSC"
pdf_path = os.path.join(folder, "paper_1_19_2019.pdf")
txt_path = os.path.join(folder, "paper_1_19_2019.txt")
temp_img_path = os.path.join(folder, "temp_ppsc_page.jpg")

if not os.path.exists(pdf_path):
    print(f"Error: PDF not found at {pdf_path}")
    sys.exit(1)

print("Initializing EasyOCR reader...", flush=True)
import easyocr
reader = easyocr.Reader(['en'], gpu=False)
print("EasyOCR reader initialized.", flush=True)

try:
    doc = fitz.open(pdf_path)
    total_pages = len(doc)
except Exception as e:
    print(f"Error opening PDF: {e}")
    sys.exit(1)

# Check already processed pages to support resume
processed_pages = set()
if os.path.exists(txt_path):
    with open(txt_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
        matches = re.findall(r"--- Page (\d+) ---", content)
        for m in matches:
            processed_pages.add(int(m))

print(f"Total pages: {total_pages}. Already processed: {len(processed_pages)} pages.")

mode = "a" if os.path.exists(txt_path) and os.path.getsize(txt_path) > 0 else "w"

try:
    with open(txt_path, mode, encoding="utf-8") as out_f:
        for page_idx in range(total_pages):
            page_num = page_idx + 1
            if page_num in processed_pages:
                continue
                
            print(f"Processing page {page_num}/{total_pages}...", end="", flush=True)
            start_time = time.time()
            
            try:
                # Render page to image
                page = doc.load_page(page_idx)
                pix = page.get_pixmap(dpi=150)
                pix.save(temp_img_path)
                
                # Run OCR
                result = reader.readtext(temp_img_path, detail=0)
                page_text = " ".join(result)
                
                # Write to file
                out_f.write(f"\n\n--- Page {page_num} ---\n{page_text}\n")
                out_f.flush()
                
                elapsed = time.time() - start_time
                print(f" Done ({elapsed:.2f}s).", flush=True)
                
            except Exception as page_e:
                print(f" Error on page {page_num}: {page_e}", flush=True)
                
finally:
    try:
        doc.close()
    except:
        pass
    if os.path.exists(temp_img_path):
        os.remove(temp_img_path)

print("\nOCR extraction complete!", flush=True)
