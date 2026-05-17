import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Document, Page } from 'react-pdf';

const PDFViewer = ({ 
  pdfBytes, 
  currentPage, 
  numPages, 
  placedSignatures, 
  selectedSignature, 
  handleSignatureChange, 
  deleteSignature,
  onSelectSignature,
  onDeselectSignature,
  goToPrevPage, 
  goToNextPage,
  onDocumentLoadSuccess,
  onPageRender,
  pdfContainerRef
}) => {
  const [pageSize, setPageSize] = useState({ width: 600, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotateStart, setRotateStart] = useState({ x: 0, y: 0 });
  const [initialSig, setInitialSig] = useState(null);
  const [pdfWidth, setPdfWidth] = useState(600);
  const overlayRef = useRef(null);
  const containerRef = useRef(null);
  
  // Memoize the file object to prevent unnecessary reloads
  const file = useMemo(() => {
    if (!pdfBytes) return null;
    return { data: pdfBytes };
  }, [pdfBytes]);
  
  // Calculate responsive PDF width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // On mobile, use full width minus padding
        const newWidth = Math.min(600, containerWidth - 32); // 32px for padding
        setPdfWidth(newWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);
  
  // Handle PDF render - calculate scale factor
  const handlePageRender = (page) => {
    setPageSize({
      width: page.width,
      height: page.height
    });
    onPageRender(pdfWidth);
  };
  
  // Get signatures for current page
  const currentPageSignatures = placedSignatures.filter(sig => sig.page === currentPage);
  
  // Handle keyboard delete for selected signature
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedSignature) {
        // Don't delete if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
          return;
        }
        e.preventDefault();
        deleteSignature(selectedSignature);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSignature, deleteSignature]);
  
  // Get client position from mouse or touch event
  const getEventPosition = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    return { clientX: e.clientX, clientY: e.clientY };
  };
  
  // Handle mouse/touch move for drag and resize
  const handleMove = useCallback((e) => {
    if (!selectedSignature) return;
    
    const sig = placedSignatures.find(s => s.id === selectedSignature);
    if (!sig) return;
    
    const { clientX, clientY } = getEventPosition(e);
    
    if (isDragging) {
      const deltaX = clientX - dragStart.x;
      const deltaY = clientY - dragStart.y;
      
      handleSignatureChange(selectedSignature, {
        ...sig,
        x: initialSig.x + deltaX,
        y: initialSig.y + deltaY,
      });
    } else if (isResizing && resizeHandle) {
      const deltaX = clientX - dragStart.x;
      const deltaY = clientY - dragStart.y;
      
      let newWidth = initialSig.width;
      let newHeight = initialSig.height;
      let newX = initialSig.x;
      let newY = initialSig.y;
      
      // Handle different resize directions
      if (resizeHandle.includes('right')) {
        newWidth = Math.max(30, initialSig.width + deltaX);
      }
      if (resizeHandle.includes('left')) {
        newWidth = Math.max(30, initialSig.width - deltaX);
        newX = initialSig.x + deltaX;
      }
      if (resizeHandle.includes('bottom')) {
        newHeight = Math.max(20, initialSig.height + deltaY);
      }
      if (resizeHandle.includes('top')) {
        newHeight = Math.max(20, initialSig.height - deltaY);
        newY = initialSig.y + deltaY;
      }
      
      handleSignatureChange(selectedSignature, {
        ...sig,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      });
    } else if (isRotating) {
      const centerX = initialSig.x + initialSig.width / 2;
      const centerY = initialSig.y + initialSig.height / 2;

      const startAngle = Math.atan2(rotateStart.y - centerY, rotateStart.x - centerX) * (180 / Math.PI);
      const currentAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);

      let newAngle = initialSig.rotation - (currentAngle - startAngle);

      // Normalize to -180..180
      while (newAngle > 180) newAngle -= 360;
      while (newAngle < -180) newAngle += 360;

      handleSignatureChange(selectedSignature, {
        ...sig,
        rotation: newAngle,
      });
    }
  }, [isDragging, isResizing, isRotating, resizeHandle, dragStart, rotateStart, initialSig, selectedSignature, placedSignatures, handleSignatureChange]);
  
  // Handle mouse/touch up to end drag/resize/rotate
  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    setResizeHandle(null);
  }, []);
  
  // Add global mouse/touch event listeners
  useEffect(() => {
    if (isDragging || isResizing || isRotating) {
      const moveHandler = (e) => {
        e.preventDefault();
        handleMove(e);
      };
      
      window.addEventListener('mousemove', moveHandler);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', moveHandler, { passive: false });
      window.addEventListener('touchend', handleEnd);
      
      return () => {
        window.removeEventListener('mousemove', moveHandler);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', moveHandler);
        window.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging, isResizing, isRotating, handleMove, handleEnd]);
  
  // Handle signature mouse/touch start (for drag)
  const handleSignatureStart = (e, sigId) => {
    if (e.target.classList.contains('resize-handle') || e.target.classList.contains('signature-delete-btn') || e.target.classList.contains('rotation-handle')) {
      return;
    }
    
    e.stopPropagation();
    e.preventDefault();
    onSelectSignature(sigId);
    
    const sig = placedSignatures.find(s => s.id === sigId);
    if (sig) {
      const { clientX, clientY } = getEventPosition(e);
      setIsDragging(true);
      setDragStart({ x: clientX, y: clientY });
      setInitialSig({ ...sig });
    }
  };
  
  // Handle resize handle mouse/touch start
  const handleResizeStart = (e, sigId, handle) => {
    e.stopPropagation();
    e.preventDefault();
    
    const sig = placedSignatures.find(s => s.id === sigId);
    if (sig) {
      const { clientX, clientY } = getEventPosition(e);
      setIsResizing(true);
      setResizeHandle(handle);
      setDragStart({ x: clientX, y: clientY });
      setInitialSig({ ...sig });
    }
  };
  
  // Handle rotation handle mouse/touch start
  const handleRotateStart = (e, sigId) => {
    e.stopPropagation();
    e.preventDefault();

    const sig = placedSignatures.find(s => s.id === sigId);
    if (sig) {
      const { clientX, clientY } = getEventPosition(e);
      setIsRotating(true);
      setRotateStart({ x: clientX, y: clientY });
      setInitialSig({ ...sig });
    }
  };

  // Handle click on PDF background to deselect signature
  const handlePdfClick = (e) => {
    // Check if the click is on a signature item or its children
    const isSignatureClick = e.target.closest('.signature-item');
    
    // If not clicking on a signature, deselect
    if (!isSignatureClick) {
      onDeselectSignature();
    }
  };

  // Handle delete button click
  const handleDeleteClick = (e, sigId) => {
    e.stopPropagation();
    deleteSignature(sigId);
  };

  return (
    <div className="pdf-workspace" ref={pdfContainerRef}>
      {/* PDF Viewer with Signatures */}
      <div className="pdf-viewer-container" ref={containerRef}>
        <div className="pdf-viewer" onClick={handlePdfClick}>
          <div className="pdf-page-wrapper">
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className="pdf-loading">Loading PDF...</div>}
              error={<div className="pdf-error">Failed to load PDF</div>}
            >
              <Page 
                pageNumber={currentPage}
                width={pdfWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                onRenderSuccess={handlePageRender}
                className="pdf-page"
              />
            </Document>
            
            {/* Placed Signatures Overlay */}
            <div 
              className="signatures-overlay" 
              ref={overlayRef}
              style={{ width: pdfWidth, height: pageSize.height || 'auto' }}
            >
              {currentPageSignatures.map(sig => (
                <div
                  key={sig.id}
                  className={`signature-item ${selectedSignature === sig.id ? 'selected' : ''}`}
                  style={{
                    position: 'absolute',
                    left: sig.x,
                    top: sig.y,
                    width: sig.width,
                    height: sig.height,
                    transform: sig.rotation ? `rotate(${sig.rotation}deg)` : undefined,
                  }}
                  onMouseDown={(e) => handleSignatureStart(e, sig.id)}
                  onTouchStart={(e) => handleSignatureStart(e, sig.id)}
                >
                  <img 
                    src={sig.data} 
                    alt="Placed Signature" 
                    draggable={false}
                    className="signature-image"
                  />
                  
                  {/* Resize Handles and Delete Button - only show when selected */}
                  {selectedSignature === sig.id && (
                    <>
                      {/* Corner handles */}
                      <div 
                        className="resize-handle resize-handle-top-left" 
                        onMouseDown={(e) => handleResizeStart(e, sig.id, 'top-left')}
                        onTouchStart={(e) => handleResizeStart(e, sig.id, 'top-left')}
                      />
                      <div 
                        className="resize-handle resize-handle-top-right" 
                        onMouseDown={(e) => handleResizeStart(e, sig.id, 'top-right')}
                        onTouchStart={(e) => handleResizeStart(e, sig.id, 'top-right')}
                      />
                      <div 
                        className="resize-handle resize-handle-bottom-left" 
                        onMouseDown={(e) => handleResizeStart(e, sig.id, 'bottom-left')}
                        onTouchStart={(e) => handleResizeStart(e, sig.id, 'bottom-left')}
                      />
                      <div 
                        className="resize-handle resize-handle-bottom-right" 
                        onMouseDown={(e) => handleResizeStart(e, sig.id, 'bottom-right')}
                        onTouchStart={(e) => handleResizeStart(e, sig.id, 'bottom-right')}
                      />
                      
                      {/* Edge handles */}
                      <div 
                        className="resize-handle resize-handle-top" 
                        onMouseDown={(e) => handleResizeStart(e, sig.id, 'top')}
                        onTouchStart={(e) => handleResizeStart(e, sig.id, 'top')}
                      />
                      <div 
                        className="resize-handle resize-handle-right" 
                        onMouseDown={(e) => handleResizeStart(e, sig.id, 'right')}
                        onTouchStart={(e) => handleResizeStart(e, sig.id, 'right')}
                      />
                      <div 
                        className="resize-handle resize-handle-bottom" 
                        onMouseDown={(e) => handleResizeStart(e, sig.id, 'bottom')}
                        onTouchStart={(e) => handleResizeStart(e, sig.id, 'bottom')}
                      />
                      <div 
                        className="resize-handle resize-handle-left" 
                        onMouseDown={(e) => handleResizeStart(e, sig.id, 'left')}
                        onTouchStart={(e) => handleResizeStart(e, sig.id, 'left')}
                      />
                      
                      {/* Delete button */}
                      <button 
                        className="signature-delete-btn"
                        onClick={(e) => handleDeleteClick(e, sig.id)}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        title="Delete signature (or press Delete key)"
                        aria-label="Delete signature"
                      >
                        ×
                      </button>

                      {/* Rotation handle */}
                      <div
                        className="rotation-handle"
                        onMouseDown={(e) => handleRotateStart(e, sig.id)}
                        onTouchStart={(e) => handleRotateStart(e, sig.id)}
                        title="Drag to rotate"
                        aria-label="Rotate signature"
                      >
                        <div className="rotation-handle-line"></div>
                        <div className="rotation-handle-icon">↻</div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Page Navigation */}
        {numPages && numPages > 1 && (
          <div className="page-navigation">
            <button 
              className="page-nav-button"
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              aria-label="Go to previous page"
            >
              ← Previous
            </button>
            <span className="page-indicator" aria-live="polite">
              Page {currentPage} of {numPages}
            </span>
            <button 
              className="page-nav-button"
              onClick={goToNextPage}
              disabled={currentPage >= numPages}
              aria-label="Go to next page"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
