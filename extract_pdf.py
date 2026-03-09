import PyPDF2

reader = PyPDF2.PdfReader(r'c:\Users\m\Downloads\PROJECT GUIDELINES TTS3424_1125 (1).pdf')
for i, page in enumerate(reader.pages):
    text = page.extract_text()
    if text:
        print(f'=== PAGE {i+1} ===')
        print(text)
        print()
