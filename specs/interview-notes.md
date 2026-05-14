# Phase 0: Dynamic Foundational Interview Notes

## Zone A: The Problem & The Pain

**Q: What are you trying to solve or automate?**
**A:** Make signing a PDF easy.

**Q: How do you sign a PDF today? Walk me through the step-by-step process you currently use. What is the most painful part about it?**
**A:** Don't sign PDFs regularly today. When needed, the painful part is finding a free online page to do it and being able to download the signed file cleanly (without watermarks, paywalls, or hassle).

## Zone B: The Environment & Constraints

**Q: Where does this live? (Your laptop, a server, cloud, embedded device?)**
**A:** Wants it to live in the browser, but ultimately other people should be able to access it as well. So it needs to be a web application hosted somewhere accessible.

**Q: Who are "other people"? Is this for your team, friends, or the general public?**
**A:** General public on the internet.

**Q: Where do you want to host this?**
**A:** Vercel.

## Zone C: The Desired Future State

**Q: When a user signs a PDF, what does the actual signature look like? (Draw, type, upload image?)**
**A:** Wants all options: Draw with mouse/finger, type name with a font, and upload an image of their signature.

**Q: Once the user has their signature ready, how do they place it on the PDF?**
**A:** Drag and drop, like placing an element on Canva.

**Q: After the user places their signature and downloads the PDF, is there anything else they need to do?**
**A:** No, purely for placing a signature and downloading.

**Q: Do you want the PDF processing to happen entirely in the user's browser (client-side) or uploaded to the server for processing?**
**A:** Fully client side. Maximum privacy, no server storage.

**Q: Do you have a preference for a frontend framework?**
**A:** Best tool for the job. Wants it to be reliable, consistent, not clunky, solid.

**Decision:** React. It has the most mature ecosystem for complex interactive UIs (drag-and-drop, canvas drawing) and PDF manipulation libraries (like pdf-lib), ensuring a solid, non-clunky experience.

## Zone D: The Operational Reality

**Q: Who maintains this in 6 months?**
**A:** It's a portfolio project. Set and forget. Maybe improvements in the far future, but unknown for now.

## Zone E: The Deployment Context

**Q: How does this get deployed?**
**A:** Vercel handles it. Push to main branch, Vercel auto-builds and deploys. Zero manual server setup. Deployment is essentially `git push`.

## Zone F: The AI's Synthesis & Recommendations

### Here's what I understand so far:
You want a free, public, portfolio-quality web app that lets anyone sign a PDF easily without uploading their sensitive documents to a server. It must feel smooth and solid (like Canva's drag-and-drop), offer multiple ways to sign (draw, type, upload), and output a clean, watermark-free PDF. It needs to live on Vercel and be low-maintenance.

### Architectural Approach: React + Vite SPA with Client-Side PDF Engine

**1. Frontend Framework:** React (via Vite for fast builds).
**2. PDF Rendering:** `react-pdf` (backed by `pdfjs-dist`) to display the PDF pages so the user can see where to sign.
**3. PDF Manipulation:** `pdf-lib` to embed the signature image/text into the original PDF bytes and save the new file. This runs 100% in the browser.
**4. Interactive UI (The "Canva" feel):** `react-rnd` (for resizable and draggable elements) overlaid on top of the rendered PDF. This handles the drag, drop, and resize logic smoothly.
**5. Signature Generation:**
   - *Draw:* `react-signature-canvas` (captures drawn signature to a transparent PNG).
   - *Type:* Convert text to an image using a canvas API or a library like `html-to-image` with a nice cursive font.
   - *Upload:* Standard file input accepting images, converted to a usable format.
**6. Deployment:** Vercel CLI / Git integration. Zero backend required.

### Why this path?
- **Reliable & Solid:** `pdf-lib` is the industry standard for client-side PDF manipulation. It doesn't break PDFs.
- **Not Clunky:** `react-rnd` gives that snappy, Canva-like drag-and-resize feel without building a complex canvas engine from scratch.
- **Deployment-First:** Since there is no backend, Vercel just serves static files. Deployment is literally just connecting your GitHub repo. Rollback is just reverting a commit.
- **Zero-Ping-Pong:** We will implement a React Error Boundary that catches any rendering or PDF processing crashes and shows a clear, plain-English message (e.g., "That PDF might be corrupted or password-protected. Please try another file.") instead of a white screen or cryptic error.

### The Deployment Plan
1. Initialize project with Vite + React.
2. Connect GitHub repo to Vercel.
3. Every `git push` to `main` automatically builds and deploys.
4. No `deploy.sh` needed because Vercel handles the entire pipeline, but we will include a `vercel.json` for configuration.

**Status:** Phase 0 Complete. Architecture confirmed. Phase 1 Complete. Departments created. Phase 2 In Progress (Backend Dept Complete, moving to UI Dept).
