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
