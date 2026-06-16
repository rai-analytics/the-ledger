import os
import sys
import json
import urllib.request
import urllib.error
import time

folder = r"a:\Business Analyst 2025 and 2026\The_Ledger\PPSC"
txt_path = os.path.join(folder, "paper_1_19_2019.txt")
output_json_path = os.path.join(folder, "new_ppsc_questions.json")

# Load API keys
api_keys = []
key_file = r"F:\Islamic readings\api_key.txt"
if os.path.exists(key_file):
    with open(key_file, "r", encoding="utf-8") as f:
        lines = f.read().splitlines()
        for line in lines:
            val = line.split("=", 1)[1] if "=" in line else line
            val = val.strip().strip('"').strip("'")
            if val.startswith("AIzaSy"):
                api_keys.append(val)

if not api_keys:
    print("Error: No valid Gemini API keys found in F:\\Islamic readings\\api_key.txt")
    sys.exit(1)

# Read raw text
if not os.path.exists(txt_path):
    print(f"Error: Raw OCR text not found at {txt_path}. Please complete OCR first.")
    sys.exit(1)

with open(txt_path, "r", encoding="utf-8", errors="ignore") as f:
    raw_content = f.read()

# Chunk raw content (5000 characters per chunk, approx. 1-2 pages of text)
chunks = []
chunk_size = 5000
for i in range(0, len(raw_content), chunk_size):
    chunks.append(raw_content[i:i+chunk_size])

print(f"Loaded {len(api_keys)} API keys. Text split into {len(chunks)} chunks for AI parsing.", flush=True)

current_key_idx = 0

class AllKeysExhaustedException(Exception):
    pass

def parse_chunk_with_gemini(chunk, chunk_num):
    global current_key_idx
    
    if current_key_idx >= len(api_keys):
        raise AllKeysExhaustedException("All keys exhausted.")
        
    prompt = f"""
    You are an expert data engineer. Parse the following raw PPSC past paper text chunk and extract the multiple-choice questions (MCQs).
    For each MCQ, output a structured JSON object. Format the response as a valid JSON array of objects.
    Each object must have the following keys:
    - id: Unique string ID starting with 'PPSC-19-' followed by 4 sequential digits (e.g. 'PPSC-19-0001').
    - division: 'Cartography' if geographic/historical, 'Surveillance' if politics/current affairs, 'Archive' otherwise.
    - subject: One of 'Pakistan Studies', 'Islamic Studies', 'Geography', 'General Knowledge', 'English', 'Computer Science', 'Everyday Science'.
    - sub_subject: A relevant sub-topic name (e.g., 'Pre-Partition', 'Capitals & Currencies', 'Grammar', 'Hardware').
    - dossier_name: A short, punchy 3-5 word title for the question topic.
    - overview: A short 1-sentence description of the fact.
    - question: The full question text.
    - verified_answer: The correct answer option text (do not just say A or B, write the actual answer text).
    - context: A brief historical or conceptual context of the fact.
    - reddington_story: A short 2-3 sentence paragraph in the voice of Raymond Reddington (from The Blacklist), sharing a cynical, world-weary anecdote or personal memory related to this fact or location.
    - connections: An array of 3-5 keywords related to the topic.
    - past_paper: The past paper source name (e.g., 'PPSC Assistant S&GAD (2019)').
    - coordinates: [latitude, longitude] array if the question refers to a specific country, city, mountain, river, or battle site. If not geographic, omit this key.
    
    Ensure the JSON is completely valid and properly escaped. Output ONLY the JSON array. Do not include markdown code fences like ```json.
    
    Raw Text Chunk:
    {chunk}
    """
    
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "safetySettings": [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
        ],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json"
        }
    }
    
    while current_key_idx < len(api_keys):
        api_key = api_keys[current_key_idx]
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        
        for attempt in range(3):
            try:
                with urllib.request.urlopen(req, timeout=45) as response:
                    res_data = json.loads(response.read().decode("utf-8"))
                    candidates = res_data.get("candidates", [])
                    if not candidates:
                        raise Exception("No candidates returned.")
                    candidate = candidates[0]
                    content = candidate.get("content")
                    if not content:
                        raise Exception("Blocked by safety/recitation filters.")
                    text = content["parts"][0]["text"]
                    return json.loads(text.strip())
            except urllib.error.HTTPError as e:
                if e.code in (403, 429):
                    if e.code == 429 and attempt < 2:
                        time.sleep(2 ** attempt)
                        continue
                    current_key_idx += 1
                    break
                else:
                    current_key_idx += 1
                    break
            except Exception as e:
                if attempt < 2:
                    time.sleep(2)
                    continue
                current_key_idx += 1
                break
                
    raise AllKeysExhaustedException("All provided Gemini API keys have been exhausted.")

parsed_questions = []
try:
    for idx, chunk in enumerate(chunks):
        print(f"Parsing chunk {idx+1}/{len(chunks)}...", end="", flush=True)
        try:
            res = parse_chunk_with_gemini(chunk, idx+1)
            if res:
                parsed_questions.extend(res)
                print(f" Success! Extracted {len(res)} MCQs.", flush=True)
            else:
                print(" No questions extracted.", flush=True)
        except AllKeysExhaustedException as ake:
            print(f"\n[ERROR] {ake}", flush=True)
            break
        except Exception as e:
            print(f" Failed: {e}", flush=True)
        time.sleep(2)

finally:
    if parsed_questions:
        # Save to JSON file
        with open(output_json_path, "w", encoding="utf-8") as f:
            json.dump(parsed_questions, f, indent=2, ensure_ascii=False)
        print(f"\nSuccessfully saved {len(parsed_questions)} structured MCQs to: new_ppsc_questions.json", flush=True)
    else:
        print("\nNo questions were parsed successfully.", flush=True)
