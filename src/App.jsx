import { useState, useRef, useEffect, useCallback } from 'react'
import { PDFDocument, degrees } from 'pdf-lib'
import { pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import './App.css'
import UploadSection from './components/UploadSection'
import Toolbar from './components/Toolbar'
import SignaturePanel from './components/SignaturePanel'
import PDFViewer from './components/PDFViewer'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes
const LOCAL_STORAGE_KEY = 'easy_pdf_signature'

// Signature constraints
const MIN_SIGNATURE_SIZE = 10
const MAX_SIGNATURE_SIZE = 500

function App() {
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfBytes, setPdfBytes] = useState(null)
  const [pdfInfo, setPdfInfo] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [passwordPrompt, setPasswordPrompt] = useState(null)
  const [passwordError, setPasswordError] = useState(null)
  const [passwordInput, setPasswordInput] = useState('')
  
  // Signature state
  const [signatureMode, setSignatureMode] = useState(null) // 'draw', 'type', 'upload'
  const [typedSignature, setTypedSignature] = useState('')
  const [savedSignature, setSavedSignature] = useState(null)
  
  // Placed signatures state
  const [placedSignatures, setPlacedSignatures] = useState([])
  const [selectedSignature, setSelectedSignature] = useState(null)
  
  // PDF scale factor for coordinate mapping
  const [pdfScale, setPdfScale] = useState(1)
  
  const fileInputRef = useRef(null)
  const signatureImageInputRef = useRef(null)
  const sigCanvasRef = useRef(null)
  const pdfContainerRef = useRef(null)
  
  // Load signature from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Validate stored data structure
        if (parsed && typeof parsed === 'object' && parsed.data) {
          setSavedSignature(parsed.data)
        } else {
          // Clear corrupted data
          localStorage.removeItem(LOCAL_STORAGE_KEY)
        }
      }
    } catch (err) {
      console.error('Error loading signature from local storage:', err)
      localStorage.removeItem(LOCAL_STORAGE_KEY)
    }
  }, [])
  
  // Save signature to local storage
  const saveSignature = useCallback((dataUrl) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ data: dataUrl }))
      setSavedSignature(dataUrl)
    } catch (err) {
      console.error('Error saving signature to local storage:', err)
    }
  }, [])
  
  // Clear signature from local storage
  const clearSignature = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY)
    setSavedSignature(null)
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear()
    }
  }, [])
  
  // Validate file is a PDF
  const validateFile = (file) => {
    // Check file type
    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'Please upload a valid PDF file.' }
    }
    
    // Check file extension
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return { valid: false, error: 'Please upload a valid PDF file.' }
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: 'File size exceeds 10MB limit. Please upload a smaller PDF.' }
    }
    
    // Check for empty file
    if (file.size === 0) {
      return { valid: false, error: 'The uploaded file is empty. Please upload a valid PDF.' }
    }
    
    return { valid: true }
  }
  
  // Validate signature image
  const validateSignatureImage = (file) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Please upload a valid image file (PNG, JPG, GIF).' }
    }
    if (file.size === 0) {
      return { valid: false, error: 'The uploaded image is empty. Please upload a valid image.' }
    }
    return { valid: true }
  }
  
  // Sanitize typed signature text
  const sanitizeText = (text) => {
    // Remove any potentially dangerous characters
    return text.replace(/[<>"'&]/g, '').trim()
  }
  
  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Reset state
    setError(null)
    setPdfFile(null)
    setPdfBytes(null)
    setPdfInfo(null)
    setNumPages(null)
    setCurrentPage(1)
    setPlacedSignatures([])
    setSelectedSignature(null)

    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      setError(validation.error)
      return
    }

    setIsLoading(true)

    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()
      
      // Create a copy for pdf-lib validation (it may detach the buffer)
      const validationBuffer = new Uint8Array(arrayBuffer.slice(0))
      
      // Load PDF with pdf-lib to validate and get info
      const pdfDoc = await PDFDocument.load(validationBuffer, {
        ignoreEncryption: false,
      })
      
      const pageCount = pdfDoc.getPageCount()
      const fileSizeKB = (file.size / 1024).toFixed(2)
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
      
      // Get page dimensions for first page (for future signature placement)
      const firstPage = pdfDoc.getPage(0)
      const { width, height } = firstPage.getSize()
      
      setPdfFile(file)
      // Store the original bytes (not detached) for react-pdf
      setPdfBytes(new Uint8Array(arrayBuffer))
      setPdfInfo({
        fileName: file.name,
        fileSize: file.size,
        fileSizeKB,
        fileSizeMB,
        pageCount,
        width,
        height,
      })
      
    } catch (err) {
      // Handle corrupted PDFs
      if (err.message && err.message.includes('encrypted')) {
        setPasswordPrompt({ file, arrayBuffer: new Uint8Array(arrayBuffer) })
        setError(null)
      } else if (err.message && err.message.includes('Invalid PDF')) {
        setError('The file appears to be corrupted or is not a valid PDF. Please try another file.')
      } else {
        setError('Unable to load the PDF. The file may be corrupted or invalid.')
      }
      console.error('PDF load error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle password submission for encrypted PDFs
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (!passwordPrompt || !passwordPrompt.arrayBuffer) return

    const { file, arrayBuffer } = passwordPrompt

    try {
      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        password: passwordInput,
      })

      const pageCount = pdfDoc.getPageCount()
      const fileSizeKB = (file.size / 1024).toFixed(2)
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)

      const firstPage = pdfDoc.getPage(0)
      const { width, height } = firstPage.getSize()

      setPdfFile(file)
      setPdfBytes(new Uint8Array(arrayBuffer))
      setPdfInfo({
        fileName: file.name,
        fileSize: file.size,
        fileSizeKB,
        fileSizeMB,
        pageCount,
        width,
        height,
      })

      // Clear password prompt state
      setPasswordPrompt(null)
      setPasswordError(null)
      setPasswordInput('')
    } catch (err) {
      if (err.message && (err.message.includes('encrypted') || err.message.includes('password') || err.message.includes('Incorrect'))) {
        setPasswordError('Incorrect password. Please try again.')
      } else {
        setPasswordError('Unable to open the PDF. The password may be incorrect or the file may be corrupted.')
      }
      setPasswordInput('')
    }
  }

  // Handle password prompt cancel
  const handlePasswordCancel = () => {
    setPasswordPrompt(null)
    setPasswordError(null)
    setPasswordInput('')
  }

  // Handle signature mode selection (toggle: clicking same mode closes the panel)
  const handleSignatureMode = (mode) => {
    setSignatureMode(prev => prev === mode ? null : mode)
    setError(null)
  }
  
  // Handle drawn signature
  const handleDrawEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      const dataUrl = sigCanvasRef.current.toDataURL('image/png')
      saveSignature(dataUrl)
    }
  }
  
  // Handle typed signature
  const handleTypedSignatureChange = (e) => {
    const sanitized = sanitizeText(e.target.value)
    setTypedSignature(sanitized)
  }
  
  const handleTypedSignatureSave = () => {
    if (!typedSignature || typedSignature.length === 0) {
      setError('Please enter some text for your signature.')
      return
    }
    
    // Create canvas with typed text (transparent background)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 400
    canvas.height = 100
    
    // Draw signature text directly on transparent background
    ctx.fillStyle = '#000000'
    ctx.font = 'italic 36px "Brush Script MT", cursive'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2)
    
    const dataUrl = canvas.toDataURL('image/png')
    saveSignature(dataUrl)
    setSignatureMode(null)
  }
  
  // Process image to remove white/light background and make it transparent
  const makeBackgroundTransparent = (imageDataUrl) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        
        // Draw the image
        ctx.drawImage(img, 0, 0)
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        
        // Threshold for considering a pixel as "white" (0-255)
        const threshold = 240
        
        // Process each pixel
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          
          // If pixel is close to white, make it transparent
          if (r >= threshold && g >= threshold && b >= threshold) {
            data[i + 3] = 0 // Set alpha to 0 (transparent)
          }
        }
        
        // Put the modified data back
        ctx.putImageData(imageData, 0, 0)
        
        // Return as PNG to preserve transparency
        resolve(canvas.toDataURL('image/png'))
      }
      img.src = imageDataUrl
    })
  }
  
  // Handle signature image upload
  const handleSignatureImageUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    const validation = validateSignatureImage(file)
    if (!validation.valid) {
      setError(validation.error)
      return
    }
    
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        // Process the image to remove white background
        const transparentDataUrl = await makeBackgroundTransparent(e.target.result)
        saveSignature(transparentDataUrl)
        setSignatureMode(null)
      } catch (err) {
        setError('Failed to process the image. Please try again.')
        console.error('Image processing error:', err)
      }
    }
    reader.onerror = () => {
      setError('Failed to read the image file. Please try again.')
      return
    }
    reader.readAsDataURL(file)
  }
  
  // Place signature on PDF
  const placeSignature = () => {
    if (!savedSignature) {
      setError('Please create or upload a signature first.')
      return
    }
    
    const newSignature = {
      id: Date.now(),
      data: savedSignature,
      page: currentPage,
      x: 50,
      y: 50,
      width: 150,
      height: 50,
      rotation: 0,
    }
    
    setPlacedSignatures(prev => [...prev, newSignature])
    setSelectedSignature(newSignature.id)
  }
  
  // Handle signature drag/resize/rotate
  const handleSignatureChange = (id, data) => {
    setPlacedSignatures(prev => prev.map(sig => {
      if (sig.id === id) {
        // Validate size constraints
        let newWidth = data.width
        let newHeight = data.height
        
        // Enforce min/max size
        newWidth = Math.max(MIN_SIGNATURE_SIZE, Math.min(MAX_SIGNATURE_SIZE, newWidth))
        newHeight = Math.max(MIN_SIGNATURE_SIZE, Math.min(MAX_SIGNATURE_SIZE, newHeight))
        
        return {
          ...sig,
          x: data.x,
          y: data.y,
          width: newWidth,
          height: newHeight,
          rotation: data.rotation || 0,
        }
      }
      return sig
    }))
  }
  
  // Delete signature
  const deleteSignature = (id) => {
    setPlacedSignatures(prev => prev.filter(sig => sig.id !== id))
    if (selectedSignature === id) {
      setSelectedSignature(null)
    }
  }
  
  // Constrain signature to PDF bounds
  const constrainToBounds = (sig, pageWidth, pageHeight) => {
    let { x, y, width, height } = sig
    
    // Ensure signature stays within page bounds
    if (x < 0) x = 0
    if (y < 0) y = 0
    if (x + width > pageWidth) x = pageWidth - width
    if (y + height > pageHeight) y = pageHeight - height
    
    return { ...sig, x, y }
  }
  
  // Handle download with embedded signatures
  const handleDownload = async () => {
    if (!pdfBytes || !pdfFile) return
    
    if (placedSignatures.length === 0) {
      // No signatures placed, download original
      let url = null
      try {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' })
        url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = pdfFile.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (err) {
        setError('Unable to download the PDF. Please try again.')
        console.error('Download error:', err)
      } finally {
        if (url) URL.revokeObjectURL(url)
      }
      return
    }
    
    setIsDownloading(true)
    
    try {
      // Ensure we have valid bytes (re-read file if buffer was detached)
      let bytes = pdfBytes
      if (!bytes || bytes.byteLength === 0) {
        bytes = await pdfFile.arrayBuffer()
      }
      
      // Load the PDF
      const pdfDoc = await PDFDocument.load(bytes)
      
      // Embed each signature
      for (const sig of placedSignatures) {
        // Get the page
        const pageIndex = sig.page - 1
        if (pageIndex >= pdfDoc.getPageCount()) continue
        
        const page = pdfDoc.getPage(pageIndex)
        const { width: pageWidth, height: pageHeight } = page.getSize()
        
        // Calculate PDF coordinates (PDF uses bottom-left origin)
        // Convert from screen coordinates (top-left origin)
        const pdfX = sig.x / pdfScale
        const pdfY = pageHeight - (sig.y / pdfScale) - (sig.height / pdfScale)
        
        // Constrain to bounds
        const constrained = constrainToBounds(
          { ...sig, x: pdfX, y: pdfY },
          pageWidth,
          pageHeight
        )
        
        // Embed the signature image
        let signatureImage
        try {
          if (sig.data.startsWith('data:image/png')) {
            signatureImage = await pdfDoc.embedPng(sig.data)
          } else if (sig.data.startsWith('data:image/jpeg') || sig.data.startsWith('data:image/jpg')) {
            signatureImage = await pdfDoc.embedJpg(sig.data)
          } else {
            // Try PNG as fallback
            signatureImage = await pdfDoc.embedPng(sig.data)
          }
        } catch (embedErr) {
          console.error('Error embedding signature image:', embedErr)
          continue // Skip this signature if embedding fails
        }
        
        // Add the image to the page
        page.drawImage(signatureImage, {
          x: constrained.x,
          y: constrained.y,
          width: sig.width / pdfScale,
          height: sig.height / pdfScale,
          rotate: degrees(sig.rotation || 0),
        })
      }
      
      // Save the PDF
      const modifiedPdfBytes = await pdfDoc.save()
      
      // Create blob and download
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      // Add _signed to filename
      const baseName = pdfFile.name.replace('.pdf', '')
      link.download = `${baseName}_signed.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      
    } catch (err) {
      console.error('Error embedding signatures:', err)
      setError('Unable to add signatures to the PDF. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }
  
  // Handle reset/clear
  const handleReset = () => {
    setPdfFile(null)
    setPdfBytes(null)
    setPdfInfo(null)
    setNumPages(null)
    setCurrentPage(1)
    setError(null)
    setSignatureMode(null)
    setPlacedSignatures([])
    setSelectedSignature(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  

  
  // Handle PDF load success
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }
  
  // Handle PDF render - calculate scale factor
  const onPageRender = (renderedWidth) => {
    // Calculate scale factor based on PDF dimensions
    // renderedWidth is the actual pixel width from PDFViewer (responsive)
    // PDF page width is in points
    if (pdfInfo) {
      const pdfPointWidth = pdfInfo.width
      setPdfScale(renderedWidth / pdfPointWidth)
    }
  }
  
  // Handle page change
  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
    setSelectedSignature(null)
  }
  
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, numPages))
    setSelectedSignature(null)
  }
  
  // Handle deselecting signature when clicking on PDF background
  const handleDeselectSignature = () => {
    setSelectedSignature(null)
  }

  return (
      <div className="app" style={{ minHeight: '100dvh' }}>
       <header className="header">
         <h1>Easy PDF Signer</h1>
         <p>Sign your PDFs easily - no watermarks, no paywalls</p>
       </header>

       <main className="main">
         {!pdfFile ? (
           // Landing / Upload View
        <UploadSection
            isLoading={isLoading}
            error={error}
            onFileUpload={handleFileUpload}
          />
          ) : (
           // PDF Loaded View - Workspace
           <>
              <Toolbar 
                signatureMode={signatureMode}
                handleSignatureMode={handleSignatureMode}
                savedSignature={savedSignature}
                clearSignature={clearSignature}
                handleReset={handleReset}
                handleDownload={handleDownload}
                isDownloading={isDownloading}
                placedSignaturesLength={placedSignatures.length}
              />
              
               <SignaturePanel
                 signatureMode={signatureMode}
                 typedSignature={typedSignature}
                 handleTypedSignatureChange={handleTypedSignatureChange}
                 handleTypedSignatureSave={handleTypedSignatureSave}
                 handleDrawEnd={handleDrawEnd}
                 sigCanvasRef={sigCanvasRef}
                 signatureImageInputRef={signatureImageInputRef}
                 handleSignatureImageUpload={handleSignatureImageUpload}
                 savedSignature={savedSignature}
                 setSignatureMode={setSignatureMode}
                 placeSignature={placeSignature}
               />
             
             {/* Error message */}
             {error && (
               <div className="error-message">
                 {error}
               </div>
             )}
             
             {/* PDF Info Bar */}
             <div className="pdf-info-bar">
               <div className="pdf-info-left">
                 <span className="pdf-filename">{pdfInfo.fileName}</span>
                 <span className="pdf-details">
                   {pdfInfo.pageCount} {pdfInfo.pageCount === 1 ? 'page' : 'pages'} • {pdfInfo.fileSizeMB} MB
                 </span>
               </div>
               {placedSignatures.length > 0 && (
                 <div className="signature-count">
                   {placedSignatures.length} signature{placedSignatures.length !== 1 ? 's' : ''} placed
                 </div>
               )}
             </div>
             
             {/* PDF Workspace */}
              <PDFViewer
                pdfBytes={pdfBytes}
                currentPage={currentPage}
                numPages={numPages}
                placedSignatures={placedSignatures}
                selectedSignature={selectedSignature}
                handleSignatureChange={handleSignatureChange}
                deleteSignature={deleteSignature}
                onSelectSignature={setSelectedSignature}
                onDeselectSignature={handleDeselectSignature}
                goToPrevPage={goToPrevPage}
                goToNextPage={goToNextPage}
                onDocumentLoadSuccess={onDocumentLoadSuccess}
                onPageRender={onPageRender}
                pdfContainerRef={pdfContainerRef}
              />
           </>
         )}
       </main>

        <footer className="footer">
          <p>100% client-side • Your files never leave your browser</p>
        </footer>

        {/* Password Prompt Modal */}
        {passwordPrompt && (
          <div className="password-prompt-overlay">
            <form className="password-prompt-modal" onSubmit={handlePasswordSubmit}>
              <h3>Password-Protected PDF</h3>
              <p>This PDF is password-protected. Please enter the password to open it.</p>
              <input
                type="password"
                className="password-prompt-input"
                placeholder="Enter PDF password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                autoFocus
              />
              {passwordError && (
                <p className="password-prompt-error">{passwordError}</p>
              )}
              <div className="password-prompt-buttons">
                <button type="button" className="password-prompt-cancel" onClick={handlePasswordCancel}>
                  Cancel
                </button>
                <button type="submit" className="password-prompt-submit">
                  Open
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
   )
}

export default App
