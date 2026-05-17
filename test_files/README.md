# Test Files for Easy PDF Signature

This directory contains test files for manual testing of the Easy PDF Signature application.

## Files Included

### Empty Files
- `empty.pdf` - 0-byte file (for testing empty file rejection)
- `empty.txt` - 0-byte text file

### Invalid File Type Tests
- `document.jpg` - JPEG image file (should be rejected as not PDF)
- `document.txt` - Plain text file (should be rejected as not PDF)
- `document.exe` - Executable file (should be rejected as not PDF)

### Valid PDF Test Files
These are simple PDF files generated for testing:
- `simple-text.pdf` - Single page PDF with text content
- `multi-page.pdf` - 3-page PDF with text content

### Image Files for Signature Testing
- `signature.png` - PNG image file (valid signature format)
- `signature.jpg` - JPEG image file (valid signature format)
- `signature.gif` - GIF image file (valid signature format)
- `invalid-signature.txt` - Text file (invalid signature format)
- `invalid-signature.exe` - Executable file (invalid signature format)

### Corrupted File
- `corrupted.pdf` - Truncated PDF file (should be rejected as corrupted)

## How to Use These Files

1. **For upload tests**: Use the files in this directory when the test case specifies uploading a file
2. **For signature image tests**: Use the image files in the signature testing section
3. **For size limit tests**: The provided PDFs are small; to test the 10MB limit, you'll need to create or obtain a larger PDF

## Generating Additional Test Files

If you need additional test files, here are some methods:

### Creating Larger PDFs
- Use online tools like [ILovePDF](https://www.ilovepdf.com/) to merge pages
- Use desktop software like Adobe Acrobat or free alternatives
- Use command line tools like `pdftk` or `qpdf`

### Creating Corrupted PDFs
- Take a valid PDF and change a few bytes with a hex editor
- Truncate a valid PDF file
- Change the file extension of a non-PDF file to .pdf

### Creating Password-Protected PDFs
- Use Adobe Acrobat or other PDF tools to add password protection
- Use online services to password-protect PDFs

## Notes
- All files are safe for testing purposes
- The PDF files contain only basic text content
- Image files are simple colored shapes for testing