import PyPDF2

reader = PyPDF2.PdfReader(r'c:\Users\m\Downloads\FINAL REPORT.pdf')
print(f'Total pages: {len(reader.pages)}')
print()
for i, page in enumerate(reader.pages):
    text = page.extract_text()
    if text:
        print(f'=== PAGE {i+1} ===')
        print(text)
        print()
