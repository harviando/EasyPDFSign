# Easy PDF Signature

A free, client-side PDF signing tool. Upload a PDF, create or upload your signature, place it anywhere on the document, and download the signed file. Everything runs in your browser — your files never leave your device.

## Features

- **Upload PDF** — Drag and drop or click to browse (max 10MB)
- **Create Signature** — Draw, type, or upload a signature image
- **Place Signature** — Drag to position, resize with 8 handles, rotate with the rotation handle
- **Multi-page Support** — Navigate pages and place different signatures on each
- **Download** — Get your signed PDF with embedded signatures
- **100% Client-side** — No server uploads, no watermarks, no paywalls
- **Mobile Friendly** — Responsive design with touch support

## Tech Stack

- React 19 + Vite
- [pdf-lib](https://github.com/Hopding/pdf-lib) — PDF manipulation
- [react-pdf](https://github.com/wojtekmaj/react-pdf) — PDF rendering
- [react-signature-canvas](https://github.com/blackjk3/react-signature-canvas) — Signature drawing
- [Playwright](https://playwright.dev/) — E2E testing

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/easy-pdf-signature.git
cd easy-pdf-signature
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

Output is in the `dist/` directory.

### Tests

```bash
# Run all tests
npx playwright test

# Run with UI
npx playwright test --ui

# Run specific project
npx playwright test --project=chromium
```

## Deployment

See [Deployment Guide](DEPLOYMENT.md) for step-by-step instructions on deploying to Vercel via GitHub Actions.

## Project Structure

```
src/
├── App.jsx              # Main application component
├── App.css              # All styles
├── main.jsx             # Entry point with ErrorBoundary
└── components/
    ├── PDFViewer.jsx     # PDF rendering + signature overlay
    ├── SignaturePanel.jsx # Draw/Type/Upload signature UI
    ├── Toolbar.jsx       # Action buttons
    └── UploadSection.jsx # File upload UI
```

## License

MIT
