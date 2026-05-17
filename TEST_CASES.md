# Manual Test Cases for Easy PDF Signature

## Overview
This document provides step-by-step manual test cases to verify the functionality of the Easy PDF Signature application before deployment. Based on the actual implementation using React, Vite, pdf-lib, react-pdf, and related libraries.

## Test Environment
- Browser: Modern Chrome, Firefox, Safari, or Edge
- Application URL: http://localhost:5173 (or deployed URL)
- Test PDFs: Various sizes (small, medium, large <10MB), multi-page, corrupted, password-protected

## Test Cases

### 1. PDF Upload Validation
**Objective:** Verify PDF file upload validation works correctly.

#### 1.1 Valid PDF Upload
1. Navigate to the application
2. Click "Select PDF File" button or drag-and-drop a valid PDF file (<10MB)
3. Verify:
   - File is accepted
   - PDF info displays (filename, size, page count, dimensions) in the toolbar area
   - First page of PDF is rendered in viewer
   - No error messages shown
   - Upload button text changes to "Loading..." during processing

#### 1.2 Invalid File Type
1. Attempt to upload a non-PDF file (e.g., .jpg, .txt, .docx) via file input
2. Verify:
   - Error message: "Please upload a valid PDF file."
   - PDF state remains unchanged (no viewer update)
   - No PDF info displayed

#### 1.3 Wrong Extension but PDF Content
1. Rename a valid PDF to have .txt extension but keep PDF content
2. Attempt upload via file input
3. Verify:
   - Error message: "Please upload a valid PDF file."
   - Upload rejected (due to extension check in validateFile function)

#### 1.4 File Size Limit
1. Create or obtain a PDF >10MB
2. Attempt upload
3. Verify:
   - Error message: "File size exceeds 10MB limit. Please upload a smaller PDF."
   - Upload rejected

#### 1.5 Empty File
1. Attempt to upload a 0-byte file
2. Verify:
   - Error message: "The uploaded file is empty. Please upload a valid PDF."
   - Upload rejected

#### 1.6 Corrupted PDF
1. Attempt to upload a corrupted PDF file
2. Verify:
   - Error message: "The file appears to be corrupted or is not a valid PDF. Please try another file."
   - Upload rejected

#### 1.7 Password-Protected PDF
1. Attempt to upload a password-protected PDF
2. Verify:
   - Error message: "This PDF is password-protected. Please upload an unprotected PDF."
   - Upload rejected

### 2. PDF Viewer and Navigation
**Objective:** Verify PDF display and page navigation works correctly.

#### 2.1 Single Page PDF
1. Upload a single-page PDF
2. Verify:
   - Page count shows 1 in page navigation
   - Only first page is displayed
   - Previous/Next page buttons are disabled

#### 2.2 Multi-Page PDF
1. Upload a multi-page PDF (3+ pages)
2. Verify:
   - Page count shows correct number in page navigation
   - First page displayed by default
   - Next button enables navigation to page 2
   - Previous button enables navigation back to page 1
   - Current page indicator updates correctly (e.g., "Page 2 of 5")
   - Cannot navigate beyond first/last page (buttons disabled appropriately)

#### 2.3 PDF Rendering
1. Upload a PDF with text and images
2. Verify:
   - Text is readable (selectable if using underlying PDF text layer)
   - Images display correctly
   - No rendering artifacts or blank pages

### 3. Signature Creation and Management
**Objective:** Verify signature creation methods and management work correctly.

#### 3.1 Draw Signature
1. Click "Draw" button in toolbar
2. Draw a signature in the canvas that appears in the Signature Panel
3. Click "Save Signature" button
4. Verify:
   - Signature appears in canvas
   - Signature is saved (visible in saved signature display below panel)
   - Saved signature preview shows the drawn signature
   - Signature mode exits automatically after saving (toolbar buttons return to normal state)
   - "Place Signature" button becomes enabled

#### 3.2 Type Signature
1. Click "Type" button in toolbar
2. Enter text in the input field (e.g., "John Doe")
3. Observe preview updates in real-time
4. Click "Save Signature" button
5. Verify:
   - Typed text is sanitized (no special characters like <, >, ", ', &)
   - Generated signature image shows the text in Brush Script MT font
   - Saved signature preview shows the typed signature
   - Signature mode exits after saving
   - "Place Signature" button becomes enabled

#### 3.3 Upload Signature
1. Click "Upload" button in toolbar
2. Click "Select Image" button and choose a valid image file (PNG, JPG, GIF)
3. Verify:
   - Image is accepted
   - Uploaded signature preview shows the image (in saved signature display)
   - Saved signature preview matches uploaded image
   - Signature mode exits after saving
   - "Place Signature" button becomes enabled

#### 3.4 Signature Validation
1. Attempt to upload invalid image file (e.g., .exe, .pdf, .txt)
2. Verify:
   - Error message: "Please upload a valid image file (PNG, JPG, GIF)."
   - Upload rejected

#### 3.5 Empty Signature
1. In type mode, leave input empty and click Save
2. Verify:
   - Error message: "Please enter some text for your signature."
   - Signature not saved
   - Save button remains disabled when input is empty

#### 3.6 Signature Persistence
1. Create a signature (any method)
2. Refresh the page (F5 or browser refresh)
3. Verify:
   - Signature is still available in saved signature display
   - Signature persists in localStorage (check Application tab in DevTools)
   - "Place Signature" button remains enabled

#### 3.7 Clear Signature
1. Create a signature
2. Click "Clear Signature" button in toolbar
3. Verify:
   - Saved signature display becomes empty
   - Uploaded signature and typed signature fields reset
   - Signature canvas clears (if in draw mode)
   - LocalStorage entry removed (check Application tab)
   - "Place Signature" button becomes disabled

### 4. Signature Placement and Manipulation
**Objective:** Verify signature placement, movement, resizing, rotation, and deletion work correctly.

#### 4.1 Place Signature
1. Upload a PDF
2. Create or ensure a signature is saved
3. Click "Place Signature" button in toolbar
4. Verify:
   - New signature appears on PDF at default position (50,50 from top-left)
   - Signature is selectable (shows selection handles when clicked)
   - Signature appears in placed signatures (can be verified by checking state in DevTools if needed)
   - Clicking the signature selects it (highlighted appearance)
   - "Download Signed" button becomes enabled in toolbar

#### 4.2 Move Signature
1. Place a signature on PDF
2. Click and drag the signature to a new position
3. Verify:
   - Signature moves with mouse/touch during drag
   - Signature snaps back if moved outside PDF bounds (constrained to viewer container)
   - Position updates correctly (can verify by checking signature data)
   - Signature remains selectable after moving

#### 4.3 Resize Signature
1. Place a signature on PDF
2. Hover over edge/corner to see resize cursor
3. Drag resize handles to change width/height
4. Verify:
   - Signature resizes as expected
   - Size constrained between MIN_SIGNATURE_SIZE (10) and MAX_SIGNATURE_SIZE (500)
   - Size updates in placed signatures data
   - Aspect ratio is not locked (can resize width and height independently)

#### 4.4 Rotate Signature
1. Place a signature on PDF
2. Hover near corner to see rotate cursor
3. Drag rotate handle to rotate signature
4. Verify:
   - Signature rotates around its center point
   - Rotation angle updates in placed signatures data
   - Rotation works in both directions (positive and negative degrees)
   - Signature maintains position during rotation

#### 4.5 Delete Signature
1. Place one or more signatures on PDF
2. Select a signature (click on it)
3. Click delete button (×) that appears when selected
4. Verify:
   - Selected signature is removed from PDF
   - Signature removed from placed signatures list
   - If deleted signature was selected, selection clears
   - If no signatures remain, "Download Signed" button reverts to "Download Original"

#### 4.6 Multiple Signatures
1. Place multiple signatures on same or different pages
2. Verify:
   - All signatures are visible on their respective pages
   - Can select and manipulate each signature independently
   - Signatures stay on their assigned pages when navigating
   - Only signatures on current page are interactive

#### 4.7 Page-Specific Signatures
1. Place a signature on page 1 of a multi-page PDF
2. Navigate to page 2 using navigation buttons
3. Verify:
   - Signature from page 1 is not visible
4. Navigate back to page 1
5. Verify:
   - Signature from page 1 is visible again
   - Signature retains its position, size, and rotation

#### 4.8 Boundary Constraints
1. Place a signature near PDF edge
2. Attempt to drag it outside PDF boundaries (beyond viewer container)
3. Verify:
   - Signature cannot be dragged outside visible PDF area
   - Signature is constrained to stay within page bounds
   - Same constraint applies when resizing near edges

### 5. Download Functionality
**Objective:** Verify PDF download works correctly with and without signatures.

#### 5.1 Download Without Signatures
1. Upload a PDF
2. Do not place any signatures
3. Click "Download Original" button in toolbar
4. Verify:
   - Original PDF is downloaded
   - Filename matches original (no _signed suffix)
   - Downloaded file is valid PDF (can open in PDF viewer)
   - Content matches original exactly (no modifications)
   - Download happens without loading state (immediate)

#### 5.2 Download With Signatures
1. Upload a PDF
2. Place one or more signatures on PDF (can be on different pages)
3. Click "Download Signed" button in toolbar
4. Verify:
   - Button shows loading state during processing
   - Downloaded filename has _signed suffix (e.g., document_signed.pdf)
   - Downloaded file is valid PDF
   - Signatures appear in correct positions on correct pages
   - Signature properties (size, rotation) are preserved
   - Original PDF content remains unchanged underneath signatures
   - No extra pages added or removed

#### 5.3 Download During Processing
1. Upload a large PDF (near 10MB)
2. Click Download while PDF is still processing (if applicable)
3. Verify:
   - Download button shows loading state
   - Download initiates after processing completes
   - No errors occur during download

#### 5.4 Download Error Handling
1. Attempt to download when no PDF is loaded
2. Verify:
   - Download button is disabled (no download occurs)
   - No error shown (button simply doesn't action)

### 6. Application State and Reset
**Objective:** Verify application state management and reset functionality.

#### 6.1 Initial State
1. On first load or after reset
2. Verify:
   - No PDF loaded (upload section visible)
   - No signature saved (no saved signature display)
   - No placed signatures (PDF viewer empty if no PDF)
   - Current page = 1 (if PDF loaded)
   - No error messages
   - Upload section visible when no PDF
   - Toolbar shows appropriate button states

#### 6.2 Reset Functionality
1. Upload a PDF, create signature, place signatures, navigate pages
2. Click "New PDF" button (reset icon) in toolbar
3. Verify:
   - PDF file cleared (viewer empty)
   - PDF bytes cleared
   - PDF info cleared (toolbar info removed)
   - Current page reset to 1
   - Error cleared
   - Signature mode cleared
   - Placed signatures cleared
   - Selected signature cleared
   - File input value cleared (can verify by checking input)
   - Upload section visible again
   - LocalStorage signature preserved (reset doesn't clear saved signature)

#### 6.3 Local Storage Isolation
1. Create signature in application (Tab A)
2. Open new browser tab/window to same application (Tab B)
3. Verify:
   - Signature is loaded from localStorage in Tab B (saved signature display shows it)
   - Actions in Tab A (placing signatures, etc.) do not affect state in Tab B
   - Actions in Tab B do not affect state in Tab A
   - LocalStorage is shared (signature persistence) but UI state is isolated

### 7. Error Handling and UI States
**Objective:** Verify error messages and loading states work correctly.

#### 7.1 Error Display
1. Trigger any validation error (invalid file, etc.)
2. Verify:
   - Error message appears in upload section (red error message)
   - Error is specific to the issue (matches validation messages in code)
   - Error disappears when valid action is taken (e.g., upload valid PDF)
   - Error area is hidden when no error

#### 7.2 Loading States
1. Upload a PDF
2. Verify:
   - Loading indicator shows during PDF processing (button text changes to "Loading...")
   - Button states update appropriately (disabled during load)
3. Place signature and download
4. Verify:
   - Loading indicator shows during signature embedding (download button shows loading state)
   - Download button shows downloading state during PDF generation
   - Buttons re-enable after completion

#### 7.3 UI Feedback
1. Interact with all buttons and controls
2. Verify:
   - Visual feedback on hover/active states (toolbar buttons change appearance)
   - Disabled states are clearly indicated (buttons appear dimmed)
   - Cursor changes for draggable/resizable/rotatable elements (move, resize, rotate cursors)
   - Selected signature has visual indication (highlighted/selected appearance)

### 8. Performance and Compatibility
**Objective:** Verify application performs well across browsers and devices.

#### 8.1 Cross-Browser Testing
1. Test in Chrome, Firefox, Safari, Edge
2. Verify:
   - All core functions work (upload, signature, download)
   - No JavaScript errors in console (check DevTools)
   - UI renders correctly (no broken layouts)
   - Signature drawing works smoothly in all browsers

#### 8.2 Responsive Design
1. Test at various screen sizes (desktop, tablet, mobile)
2. Verify:
   - Layout adapts to screen width (no horizontal overflow)
   - Controls remain accessible and usable
   - PDF viewer and signature canvas are usable
   - Toolbar wraps or adapts appropriately on small screens

#### 8.3 Large PDF Handling
1. Upload a PDF near 10MB limit
2. Verify:
   - Application remains responsive during upload and processing
   - Memory usage is reasonable (no excessive memory consumption)
   - No crashes or slowdowns during interaction
   - Download functionality works with large PDFs

## Test Data Requirements
- Valid PDF files: 1-page, 2-page, 5-page, text-heavy, image-heavy
- Invalid files: .jpg, .txt, .exe, corrupted PDF, password-protected PDF
- Image files for signature: PNG, JPG, GIF (valid and invalid types)
- Large PDF: ~9.5MB to test size limit
- Empty file: 0-byte PDF

## Pass/Fail Criteria
- All test cases must pass for deployment readiness
- Any critical functionality failure (upload, signature, download) blocks deployment
- UI/UX issues should be documented but may not block deployment if minor
- Performance issues should be noted for optimization

## Notes for Testers
- Clear browser localStorage between test sessions if testing persistence isolation (Application > Local Storage)
- Use different filenames for upload tests to avoid cache confusion
- Verify downloaded PDFs using a PDF viewer (Adobe Reader, Chrome PDF viewer, etc.) to confirm signature embedding
- Test touch interactions on touch-enabled devices if applicable (drag, resize, rotate may behave differently)
- When testing error conditions, refresh or reset application between tests to ensure clean state

---

## P1.2: Signature Rotation UI Handle

**Objective:** Verify the rotation handle appears on selected signatures and correctly rotates the signature when dragged.

**Prerequisites:** A valid PDF must be uploaded and a signature must be created and placed on the PDF.

#### P1.2.1 Rotation Handle Visibility on Selection
1. Upload a valid PDF and create a signature
2. Click "Place Signature" to place it on the PDF
3. Click on the placed signature to select it
4. Verify:
   - A rotation handle (circular handle with ↻ icon) appears above the signature
   - A vertical line connects the rotation handle to the signature top edge
   - The rotation handle has a blue background with a white border

#### P1.2.2 Rotation Handle Hidden on Deselection
1. Select a placed signature (rotation handle visible)
2. Click on the PDF background (not on any signature)
3. Verify:
   - The rotation handle disappears
   - The rotation handle line disappears
   - All resize handles also disappear

#### P1.2.3 Rotate Signature via Drag
1. Select a placed signature
2. Click and hold the rotation handle (cursor changes to grab)
3. Drag the handle in a circular motion around the signature center
4. Release the mouse button
5. Verify:
   - Signature rotates around its center point during drag
   - Rotation angle is applied (signature appears tilted/rotated)
   - Rotation works in both clockwise and counter-clockwise directions
   - The rotation handle follows the signature rotation visually

#### P1.2.4 Rotation Hint Text
1. Select a placed signature
2. Verify:
   - A hint text appears below the signature: "Drag to move • Handles to resize • ↻ to rotate"
   - The hint includes the rotation symbol (↻)

#### P1.2.5 Rotation Handle Does Not Trigger Drag
1. Select a placed signature
2. Note the current position (x, y) of the signature
3. Click on the rotation handle (mousedown + mouseup without dragging)
4. Verify:
   - The signature position does NOT change
   - Only a click on the signature body (not the rotation handle) triggers drag

#### P1.2.6 Rotation Applied to Downloaded PDF
1. Place a signature and rotate it to a noticeable angle (e.g., 45 degrees)
2. Click "Download Signed"
3. Open the downloaded PDF in a PDF viewer
4. Verify:
   - The signature appears rotated at the correct angle
   - The signature position is preserved
   - The rotation is embedded in the PDF (not just a visual overlay)

---

## P1.4: Password Prompt for Encrypted PDFs

**Objective:** Verify that password-protected PDFs trigger a password prompt modal, and the modal functions correctly for opening, canceling, and handling wrong passwords.

**Prerequisites:** A password-protected PDF file is required for these tests. Create or obtain a PDF encrypted with a known password (e.g., "testpass123").

#### P1.4.1 Password Prompt Appears for Encrypted PDF
1. Upload a password-protected PDF file
2. Verify:
   - A modal overlay appears covering the entire screen
   - The modal displays the title "Password-Protected PDF"
   - The modal shows the message "This PDF is password-protected. Please enter the password to open it."
   - The password input field is focused automatically
   - The rest of the UI is dimmed behind the overlay

#### P1.4.2 Password Input Field
1. Trigger the password prompt by uploading a password-protected PDF
2. Verify:
   - The input field is of type "password" (characters are masked)
   - The placeholder text reads "Enter PDF password"
   - Typing in the field masks the input (shows dots/asterisks)

#### P1.4.3 Open and Cancel Buttons
1. Trigger the password prompt
2. Verify:
   - An "Open" button (submit) is present
   - A "Cancel" button is present
   - Both buttons are clearly labeled and clickable

#### P1.4.4 Cancel Closes Modal
1. Trigger the password prompt
2. Click the "Cancel" button
3. Verify:
   - The modal overlay disappears
   - The password input is cleared
   - No PDF is loaded (upload section remains visible)
   - No error message is displayed

#### P1.4.5 Wrong Password Shows Error
1. Trigger the password prompt
2. Enter an incorrect password (e.g., "wrongpassword")
3. Click "Open" or press Enter
4. Verify:
   - An error message appears: "Incorrect password. Please try again."
   - The password input is cleared for re-entry
   - The modal remains open (does not close on wrong password)
   - The user can try again with a different password

#### P1.4.6 Correct Password Opens PDF
1. Trigger the password prompt
2. Enter the correct password for the PDF
3. Click "Open" or press Enter
4. Verify:
   - The modal closes
   - The PDF loads successfully
   - PDF info (filename, page count, size) is displayed
   - The PDF viewer renders the first page
   - The password is not stored (re-uploading should prompt again)

#### P1.4.7 Password Prompt UI Styling
1. Trigger the password prompt
2. Verify:
   - The overlay is semi-transparent (darkens the background)
   - The modal card is centered on screen
   - The modal has a clean, professional appearance
   - Error messages are displayed in red
   - The modal is responsive on different screen sizes