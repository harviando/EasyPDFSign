# 🌟 Project Vision: Easy PDF Signer

## Architecture Overview

This project is a **100% client-side React Single Page Application (SPA)** hosted on Vercel. It requires zero backend infrastructure, ensuring maximum privacy and zero server maintenance.

The architecture is divided into five key departments that interact as follows:

1. **UI Dept**: Provides the sharp-corner, professional interface. The top toolbar handles signature generation (Draw, Type, Upload), and the main workspace renders the PDF pages.
2. **Backend Dept**: Manages all client-side data processing. It handles PDF parsing (`pdf-lib`), PDF rendering (`react-pdf`), signature generation logic, and the critical 1:1 coordinate mapping required for exact fidelity between the editor and the exported file.
3. **Observability Dept**: Silently captures all errors, validation failures, and fidelity discrepancies via Sentry. It ensures the user never sees a white screen, instead showing friendly plain-English messages via a React Error Boundary.
4. **DevOps/Deployment Dept**: Handles the Vercel configuration and build pipeline. Deployment is simply a `git push` to the main branch.
5. **Development Batch Dept**: Orchestrates the delivery of these components in 4 vertical, testable slices.

## Data Flow

1. **Input**: User uploads a PDF file.
2. **Pre-Validation**: UI/Backend checks file size (≤10MB), MIME type, and password protection. If protected, the user is prompted for a password.
3. **Rendering**: `react-pdf` renders the PDF pages in the workspace at a locked, 1:1 scaling factor to ensure pixel-perfect representation.
4. **Signature Creation**: User creates a signature via Draw (canvas), Type (text-to-image), or Upload (file input). The signature is saved to Local Storage for future visits.
5. **Interaction**: User drags, resizes, and rotates the signature on the PDF using `react-rnd`. Boundary enforcement ensures signatures stay within page bounds.
6. **Export**: User clicks "Download". `pdf-lib` embeds the signature image into the original PDF bytes using the exact coordinates mapped from the UI, ensuring zero discrepancy.
7. **Feedback Loop**: If any step fails (corrupted PDF, invalid signature, embedding error), the error is caught defensively, reported to Sentry with full context, and a friendly message is shown to the user.

## Deployment Plan

Deployment is designed to be a non-event, requiring minimal effort from you.

1. **Connect**: Link your GitHub repository to Vercel.
2. **Configure**: Vercel auto-detects Vite + React. We include a `vercel.json` for any specific routing rules.
3. **Deploy**: Push code to the `main` branch. Vercel automatically builds and deploys.
4. **Verify**: Visit the Vercel default domain (e.g., `your-project.vercel.app`) to confirm the app loads.

**The One-Liner**: `git push origin main`

## Deployment Contract

- **Target Environment**: Vercel Edge Network (Static SPA hosting).
- **Deployment Method**: Git push to main branch (Vercel GitHub Integration).
- **Rollback Strategy**: Revert the commit in Git, or click "Rollback" in the Vercel dashboard.
- **Upgrade Path**: Future features are merged via Pull Requests. Vercel provides preview deployments for every PR before merging.

## Risk Assessment & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Coordinate Mapping Drift** (Editor preview doesn't match exported PDF) | High (Violates core user requirement) | Strict 1:1 scaling factor lock on `react-pdf`. Fidelity validation checks in Batch 3 & 4 that compare editor data to embedded data and report discrepancies to Sentry. |
| **Complex/Corrupted PDFs crashing the parser** | Medium (App becomes unresponsive) | Defensive `try/catch` wrapping around all `pdf-lib` and `react-pdf` calls. React Error Boundary to catch unhandled exceptions gracefully. |
| **LocalStorage limits/corruption** | Low (User loses saved signature) | Validate stored data on load. Silently clear corrupted data and prompt user to recreate. Do not crash the app. |
| **Password-protected PDFs blocking flow** | Medium (User cannot sign file) | Detect protection early via `pdf-lib`, prompt user for password immediately, validate before rendering. |

## Timeline Estimate

- **Batch 1 (Project Setup & Core PDF Engine)**: Size **S** — Foundational setup, basic upload/download.
- **Batch 2 (Signature Generation & Workspace)**: Size **M** — UI implementation, 3 signature methods, PDF rendering.
- **Batch 3 (Canva-Like Signature Interaction & Fidelity)**: Size **L** — Complex drag/drop/resize/rotate logic, pixel-perfect coordinate mapping, embedding logic.
- **Batch 4 (Polish, Observability & Deployment)**: Size **M** — Styling, Sentry integration, password flows, final deployment.

## Confidence Level

**High**. The ecosystem (React, `pdf-lib`, `react-pdf`, Vercel) is mature and well-documented. The requirements are clear, and the core technical risk (fidelity) has dedicated validation checks built into the development plan.

---

**Next Step**: Once you approve this vision, I will proceed to Phase 4 (Execution) and begin developing Batch 1.
