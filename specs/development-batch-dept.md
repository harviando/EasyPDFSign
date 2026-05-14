# Development Batch Department

## Phase 2 Interview

**Q: How should we break down the development into incremental batches that deliver working, testable value?**
**A:** Proposed 4 vertical slices (batches) with integrated error prevention measures (aligned with brain.txt Zero-Ping-Pong requirements):

### Error Prevention & Resilience Strategy (Cross-Batch)
1. **Pre-Validation First**: All user inputs (PDF files, signatures, passwords) are validated before any processing begins. No processing of invalid data.
2. **Defensive Wrapping**: Every call to external libraries (pdf-lib, react-pdf, react-rnd, react-signature-canvas) is wrapped in try/catch blocks with full context (what action was attempted, current state) logged to Sentry.
3. **Graceful Failure**: No white screens or cryptic errors. All failures trigger user-friendly plain English messages, with Sentry reports sent silently in the background.
4. **Input Sanitization**: All user-provided text (typed signatures) is sanitized to prevent rendering issues. Uploaded images are validated as valid image types before processing.
5. **Local Storage Safety**: Stored signatures are validated on load; corrupted/invalid data is automatically cleared with a silent Sentry warning, and the user is prompted to recreate their signature.
6. **Boundary Enforcement**: Signatures placed via react-rnd are constrained to PDF page bounds, with invalid placements (negative coordinates, outside page) auto-corrected before PDF embedding.
7. **Resource Protection**: 10MB file size limit is checked immediately on upload, before any PDF processing begins, to prevent browser crashes. Password prompts are triggered before any PDF parsing for protected files.

---

#### Batch 1: Project Setup & Core PDF Engine
- **Objective**: Initialize Vite + React project, set up core PDF loading with `pdf-lib`, and implement a basic download button that exports the original unmodified PDF.
- **Scope**: Project scaffolding, `pdf-lib` integration, basic file upload and download flow, file type validation (must be .pdf), file size pre-check (10MB limit).
- **Error Prevention Measures**:
  - Validate uploaded file is a valid PDF (check MIME type `application/pdf`, check file extension `.pdf`)
  - Reject non-PDF files immediately with user-friendly message: "Please upload a valid PDF file."
  - Enforce 10MB file size limit on upload, reject oversized files with: "File size exceeds 10MB limit. Please upload a smaller PDF."
  - Wrap `pdf-lib` load calls in try/catch to handle corrupted PDFs early, before rendering.
- **Acceptance Criteria**:
  - User can upload a valid PDF ≤10MB, view its details (file name, size, page count)
  - User can download the original unmodified PDF
  - Uploading non-PDF or oversized files shows clear error messages, no app crashes
- **Test Plan**:
  - Happy Path: Upload valid 2-page PDF ≤10MB, download original
  - Edge Cases: Upload 0-byte PDF, upload PDF with 0 pages
  - Failure Modes: Upload `.docx` file, upload 15MB PDF, upload corrupted PDF
  - Error Prevention: Verify pre-checks trigger before any `pdf-lib` processing
- **Deployment Artifact**: None (foundational setup batch).

#### Batch 2: Signature Generation & Workspace
- **Objective**: Build the top toolbar with Draw/Type/Upload signature options, implement signature creation logic, and render PDF pages using `react-pdf`.
- **Scope**: Toolbar UI (sharp corners, professional theme), signature canvas for drawing, text-to-image conversion for typed signatures, image upload for signature files, PDF page rendering, signature input validation, local storage pre-check.
- **Error Prevention Measures**:
  - Validate typed signature is not empty, contains only printable characters
  - Validate uploaded signature image is a valid image type (png, jpg, jpeg, gif), reject invalid types
  - Check local storage for existing signature on load, validate stored data structure; clear corrupted data silently
  - Wrap `react-pdf` rendering calls in try/catch to handle unsupported PDF features
  - Sanitize typed signature text to prevent XSS or rendering issues
- **Acceptance Criteria**:
  - User can create signature via all 3 methods, with input validation
  - PDF pages render correctly in workspace
  - Existing signatures load from local storage if valid, else prompt to recreate
- **Test Plan**:
  - Happy Path: Create signature via draw, type (valid text), upload (valid image)
  - Edge Cases: Type empty string, type 1000+ character signature, upload 0-byte image, upload non-image file
  - Failure Modes: Corrupted local storage data, `react-pdf` fails to render complex PDF
  - Error Prevention: Verify invalid signature inputs are rejected before processing
- **Deployment Artifact**: None (feature batch).

#### Batch 3: Canva-Like Signature Interaction
- **Objective**: Implement drag-and-drop, resize, and rotate functionality for signatures placed on the PDF, and wire the download button to embed the signature into the PDF.
- **Scope**: `react-rnd` integration for draggable/resizable/rotatable signatures, coordinate mapping between PDF render and actual PDF dimensions, `pdf-lib` embedding of signature images into the PDF, signature boundary enforcement, coordinate validation.
- **Error Prevention Measures**:
  - Constrain signature placement to within PDF page bounds; auto-adjust out-of-bounds signatures to nearest valid position
  - Validate signature size (min 10x10px, max 500x500px) to prevent embedding issues
  - Validate rotation angle (0-360 degrees) to prevent invalid PDF transformations
  - Wrap `pdf-lib` embedding calls in try/catch to handle invalid image data or coordinate mismatches
  - Check that at least one signature is placed before allowing download
- **Acceptance Criteria**:
  - User can place, resize, rotate signature on any PDF page
  - Downloaded PDF has correctly embedded signature in the right position/size/rotation
  - Invalid signature placements are auto-corrected, no PDF corruption
- **Test Plan**:
  - Happy Path: Place signature on page 1, resize, rotate 45 degrees, download signed PDF
  - Edge Cases: Place signature at page edge, resize to min/max size, rotate 360 degrees
  - Failure Modes: Embed corrupted signature image, embed signature with invalid coordinates
  - Error Prevention: Verify out-of-bounds signatures are adjusted before embedding
- **Deployment Artifact**: None (feature batch).

#### Batch 4: Polish, Observability & Deployment
- **Objective**: Apply final UI styling, implement user experience polish (local storage for signatures, 10MB file limit, password-protected PDF prompt), integrate Sentry error tracking, and finalize Vercel deployment.
- **Scope**: Sharp corner aesthetics, professional/personal color theme, local storage persistence for signatures, 10MB file size validation, password prompt for protected PDFs, Sentry SDK integration, Vercel configuration (`vercel.json`), final end-to-end error prevention checks.
- **Error Prevention Measures**:
  - Add password prompt for password-protected PDFs, validate password before parsing
  - Final pre-download check: verify all signatures are valid, PDF is intact before embedding
  - Wrap all Sentry initialization in try/catch to prevent SDK errors from crashing the app
  - Add React Error Boundary to catch unhandled exceptions, show friendly message, report to Sentry
  - Validate all environment variables (Sentry DSN) are present before initialization
- **Acceptance Criteria**:
  - App matches all UI/UX requirements
  - Handles edge cases (file size, password protection, corrupted data)
  - Reports errors to Sentry, never shows white screen to user
  - Deploys successfully to Vercel via git push
- **Test Plan**:
  - Happy Path: Full flow from upload to signed PDF download
  - Edge Cases: Password-protected PDF (valid/invalid password), corrupted local storage, Sentry DSN missing
  - Failure Modes: Unhandled exception in component, `pdf-lib` crash on complex PDF
  - Error Prevention: Verify React Error Boundary catches all crashes, Sentry receives reports
- **Deployment Artifact**: `vercel.json` configuration file, Sentry integration, final production build.

---

**Q: Does this batch plan feel right to you, or would you like to adjust the order or scope of any batch?**
**A:** [Pending user confirmation]
