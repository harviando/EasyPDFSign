# Backend Department (Client-Side Core Logic)

## Phase 2 Interview

**Q: How should the app handle protected or encrypted PDFs?**
**A:** Reject them with a clear message. For password-protected PDFs, prompt the user to input the password to unlock it before signing.

**Q: What if the PDF has multiple pages? Does the user need to navigate between pages to find the right spot to sign, or are we only dealing with single-page documents?**
**A:** Able to navigate and add their signature everywhere they like.

**Q: Should the app remember the user's signature for their next visit (using Local Storage), or should they create it fresh every time?**
**A:** Yes, remember the signature using Local Storage so they don't have to recreate it every visit.

**Q: Should we set a strict file size limit (e.g., 10MB/20MB) to prevent the browser tab from crashing on mobile or low-end devices?**
**A:** Yes, set a strict limit. Recommended limit: 10MB. This covers 99% of normal PDFs while keeping the app fast and preventing browser crashes on mobile devices.

## Error Prevention Measures
1. **PDF Password Handling**: Check for password protection before attempting to parse PDF with `pdf-lib`. Prompt for password immediately, validate password before proceeding. Reject files with invalid passwords after 3 attempts.
2. **File Size Enforcement**: Check file size on upload event (before any processing) to block oversized files early, prevent browser memory issues.
3. **Multi-Page Navigation**: Pre-load all page dimensions on PDF upload to ensure accurate coordinate mapping for signature placement across all pages.
4. **Local Storage Validation**: On app load, validate stored signature data (check for required fields: type, data URL, timestamp). Corrupted entries are removed automatically, user is prompted to recreate signature.
5. **Coordinate Mapping**: Calculate PDF page dimensions (points) vs rendered pixel dimensions to ensure signature placement coordinates are accurately translated when embedding into PDF, prevent misaligned signatures.
6. **Defensive PDF Parsing**: Wrap all `pdf-lib` and `react-pdf` parsing calls in try/catch blocks, log full context to Sentry, show user-friendly message on failure.
7. **Fidelity Validation**: After embedding a signature into the PDF, validate that the embedded signature's coordinates, size, and rotation match the editor's recorded values within 0.5 points. Log discrepancies to Sentry as high-priority errors.
8. **Scaling Factor Lock**: Lock the PDF preview scaling factor on upload, prevent any dynamic rescaling of the preview that would cause coordinate mapping errors.

## PDF Fidelity Requirements (Exact Editor-to-Export Match)
To fulfill the core requirement that the exported PDF is exactly identical to the editor preview, with zero discrepancies:
1. **1:1 Coordinate Mapping**: Calculate a precise, immutable scaling factor between `react-pdf` rendered page pixels and the PDF's internal coordinate system (72 points per inch) on every PDF upload. All signature x/y position, width, and height from the editor (in pixels) must be converted to PDF points using this exact scaling factor, with maximum 0.1 point rounding error.
2. **Lossless Signature Embedding**: Embed the original, unmodified signature image data into the PDF via `pdf-lib`:
   - Drawn signatures: Use the raw transparent PNG from `react-signature-canvas` with no re-encoding or compression.
   - Typed signatures: Use the exact rendered text image (no scaling, no font substitution) from the canvas/HTML-to-image conversion.
   - Uploaded signatures: Use the original uploaded image file with no re-encoding, preserving transparency and quality.
3. **Rotation Accuracy**: Convert editor rotation angles (degrees) to PDF rotation radians with zero drift. Apply rotation around the signature's exact center point, matching the editor's `react-rnd` rotation behavior precisely.
4. **Page Layout Preservation**: Never modify, re-render, or alter existing PDF content, metadata, or structure. The signature is embedded as a new, separate layer only. All original text, images, formatting, and layout must remain 100% unchanged.
5. **Preview Fidelity**: Configure `react-pdf` to render pages at the exact same dimensions and DPI as the actual PDF, so the editor preview is a pixel-perfect representation of the final exported PDF.
