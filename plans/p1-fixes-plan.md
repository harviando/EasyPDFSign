# P1 Fixes Plan — Easy PDF Signature

## Overview
4 P1 items identified from project analysis. All are non-blocking but should be addressed before or shortly after deployment.

---

## P1.1: Rename package name in package.json

**File:** [`package.json`](/home/harviando/Downloads/01/Workspace/Projects/Easy PDF Signature/package.json:2)
**Current:** `"name": "temp-project"`
**Target:** `"name": "easy-pdf-signature"`

This is a one-line change. The name appears in `package.json` line 2. No other files reference the package name.

---

## P1.2: Add rotation UI handle to PDFViewer.jsx

**File:** [`src/components/PDFViewer.jsx`](/home/harviando/Downloads/01/Workspace/Projects/Easy PDF Signature/src/components/PDFViewer.jsx)
**Context:** The data model already supports `rotation` on signatures (see `App.jsx:334`, `App.jsx:359`, `App.jsx:468`). The `drawImage` call at `App.jsx:468` already applies `rotate: degrees(sig.rotation || 0)`. The CSS at `PDFViewer.jsx:260` already applies `transform: rotate(${sig.rotation}deg)`.

**What's missing:** A rotation handle in the UI. Currently only resize handles and a delete button are shown when a signature is selected.

**Implementation plan:**
1. Add a rotation handle button (circular icon) above the signature item, similar to design tools
2. On the rotation handle, add `onMouseDown`/`onTouchStart` handlers that initiate a rotation drag
3. During rotation drag, calculate angle from signature center to mouse position using `Math.atan2`
4. Update `handleSignatureChange` with the new rotation value
5. Add CSS for the rotation handle in `App.css`
6. Update the hint text from "Drag to move • Handles to resize" to "Drag to move • Handles to resize • Rotate handle to rotate"

**Key code locations:**
- Signature item rendering: `PDFViewer.jsx:250-335`
- Resize handle pattern to follow: `PDFViewer.jsx:276-317`
- Drag/resize state management: `PDFViewer.jsx:20-27, 89-169`
- Rotation already in data: `App.jsx:334` (`rotation: 0`), `App.jsx:359` (`rotation: data.rotation || 0`)

---

## P1.3: Enable Webkit/Safari tests in playwright.config.js

**File:** [`playwright.config.js`](/home/harviando/Downloads/01/Workspace/Projects/Easy PDF Signature/playwright.config.js:56-60)
**Current:** Webkit project is commented out with note "Webkit disabled due to missing system dependencies"

**Implementation plan:**
1. Uncomment the webkit project block (lines 57-60)
2. Remove the comment about missing system dependencies
3. Run `npx playwright install webkit` to install webkit dependencies
4. Verify tests pass with `npx playwright test --project=webkit`

**Note:** If webkit system dependencies cannot be installed in this environment, this item should be deferred. It is not a code issue — it's an environment setup issue.

---

## P1.4: Add password prompt for encrypted PDFs

**File:** [`src/App.jsx`](/home/harviando/Downloads/01/Workspace/Projects/Easy PDF Signature/App.jsx:188-196)
**Current behavior:** When a password-protected PDF is uploaded, the error "This PDF is password-protected. Please upload an unprotected PDF." is shown.

**Target behavior:** Show a password input prompt, attempt to load the PDF with the provided password, and only show an error if the password is wrong or loading fails.

**Implementation plan:**
1. Add a new state: `const [passwordPrompt, setPasswordPrompt] = useState(null)` — stores the file awaiting password
2. In `handleFileUpload`, when the error is encryption-related (line 190-191), instead of just setting an error, set `passwordPrompt` to the file and clear the error
3. Add a password prompt UI (modal or inline) that:
   - Shows "This PDF is password-protected. Please enter the password:"
   - Has a password input field
   - Has "Submit" and "Cancel" buttons
4. On submit, retry `PDFDocument.load()` with the `password` option (pdf-lib supports `ignoreEncryption: false` with password)
5. On success, proceed normally. On failure, show "Incorrect password. Please try again."
6. On cancel, reset state and return to upload view

**pdf-lib API note:** `PDFDocument.load(bytes, { password: 'user-password' })` — need to verify this API supports password parameter. If not, this feature may not be feasible with pdf-lib alone.

---

## Execution Order

1. **P1.1** (package.json rename) — trivial, do first
2. **P1.3** (webkit tests) — environment check, do early
3. **P1.2** (rotation UI) — most complex, requires new interaction logic
4. **P1.4** (password prompt) — requires new UI flow and pdf-lib API verification
