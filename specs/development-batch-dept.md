# Development Batch Department

## Phase 2 Interview

**Q: How should we break down the development into incremental batches that deliver working, testable value?**
**A:** Proposed 4 vertical slices (batches):
1. **Batch 1: Project Setup & Core PDF Engine**
   - Objective: Initialize Vite + React project, set up core PDF loading with `pdf-lib`, and implement a basic download button that exports the original unmodified PDF.
   - Scope: Project scaffolding, `pdf-lib` integration, basic file upload and download flow.
   - Acceptance Criteria: User can upload a PDF, view its details, and download the original file unchanged.
   - Deployment Artifact: None (foundational setup batch).

2. **Batch 2: Signature Generation & Workspace**
   - Objective: Build the top toolbar with Draw/Type/Upload signature options, implement signature creation logic, and render PDF pages using `react-pdf`.
   - Scope: Toolbar UI (sharp corners, professional theme), signature canvas for drawing, text-to-image conversion for typed signatures, image upload for signature files, PDF page rendering.
   - Acceptance Criteria: User can create a signature via all 3 methods, view the PDF pages in the workspace.
   - Deployment Artifact: None (feature batch).

3. **Batch 3: Canva-Like Signature Interaction**
   - Objective: Implement drag-and-drop, resize, and rotate functionality for signatures placed on the PDF, and wire the download button to embed the signature into the PDF.
   - Scope: `react-rnd` integration for draggable/resizable/rotatable signatures, coordinate mapping between PDF render and actual PDF dimensions, `pdf-lib` embedding of signature images into the PDF.
   - Acceptance Criteria: User can place a signature on any PDF page, resize and rotate it, and download the signed PDF with the embedded signature.
   - Deployment Artifact: None (feature batch).

4. **Batch 4: Polish, Observability & Deployment**
   - Objective: Apply final UI styling, implement user experience polish (local storage for signatures, 10MB file limit, password-protected PDF prompt), integrate Sentry error tracking, and finalize Vercel deployment.
   - Scope: Sharp corner aesthetics, professional/personal color theme, local storage persistence for signatures, 10MB file size validation, password prompt for protected PDFs, Sentry SDK integration, Vercel configuration (`vercel.json`).
   - Acceptance Criteria: App matches all UI/UX requirements, handles edge cases (file size, password protection), reports errors to Sentry, deploys successfully to Vercel via git push.
   - Deployment Artifact: `vercel.json` configuration file, Sentry integration, final production build.

**Q: Does this batch plan feel right to you, or would you like to adjust the order or scope of any batch?**
**A:** [Pending user confirmation]
