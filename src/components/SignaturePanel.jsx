import { useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';

const SignaturePanel = ({ 
  signatureMode, 
  typedSignature, 
  handleTypedSignatureChange, 
  handleTypedSignatureSave, 
  handleDrawEnd, 
  sigCanvasRef, 
  signatureImageInputRef, 
  handleSignatureImageUpload, 
  savedSignature, 
  setSignatureMode,
  placeSignature 
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(500);
  
  // Calculate responsive canvas width
  useEffect(() => {
    const updateCanvasWidth = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth <= 320) {
        setCanvasWidth(280);
      } else if (screenWidth <= 375) {
        setCanvasWidth(320);
      } else if (screenWidth <= 425) {
        setCanvasWidth(380);
      } else if (screenWidth <= 768) {
        setCanvasWidth(450);
      } else {
        setCanvasWidth(500);
      }
    };
    
    updateCanvasWidth();
    window.addEventListener('resize', updateCanvasWidth);
    return () => window.removeEventListener('resize', updateCanvasWidth);
  }, []);
  
  // Reset minimized state when mode changes
  useEffect(() => {
    setIsMinimized(false);
  }, [signatureMode]);
  
  const handleMinimizeToggle = () => {
    setIsMinimized(prev => !prev);
  };
  
  const handleClose = () => {
    setSignatureMode(null);
  };
  
  return (
    <>
      {signatureMode && (
        <div className={`signature-panel ${isMinimized ? 'minimized' : ''}`}>
          <div className="signature-panel-header">
            <h3>
              {signatureMode === 'draw' && '✍️ Draw Your Signature'}
              {signatureMode === 'type' && '⌨️ Type Your Signature'}
              {signatureMode === 'upload' && '📷 Upload Your Signature'}
            </h3>
            <div className="signature-panel-actions">
              <button 
                className="signature-minimize-btn"
                onClick={handleMinimizeToggle}
                title={isMinimized ? 'Restore panel' : 'Minimize panel'}
                aria-label={isMinimized ? 'Restore' : 'Minimize'}
              >
                {isMinimized ? '▢' : '─'}
              </button>
              <button 
                className="signature-close-btn"
                onClick={handleClose}
                title="Close panel"
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </div>
          
          {isMinimized && (
            <div className="signature-panel-minimized-hint">
              Click ▢ to restore signature panel
            </div>
          )}
          
          {!isMinimized && (
            <>
              {signatureMode === 'draw' && (
                <div className="signature-draw-panel">
                  <div className="signature-canvas-container">
                    <SignatureCanvas
                      ref={sigCanvasRef}
                      penColor="black"
                      canvasProps={{
                        width: canvasWidth,
                        height: 150,
                        style: { 
                          backgroundColor: '#fff', 
                          border: '1px solid #ddd', 
                          borderRadius: '4px',
                          touchAction: 'none' // Prevent scrolling while drawing
                        }
                      }}
                      dotSize={1}
                      minWidth={0.5}
                      maxWidth={2.5}
                    />
                  </div>
                  <div className="signature-panel-buttons">
                    <button 
                      className="toolbar-button"
                      onClick={() => sigCanvasRef.current?.clear()}
                    >
                      Clear
                    </button>
                    <button 
                      className="primary-button"
                      onClick={handleDrawEnd}
                    >
                      Save Signature
                    </button>
                  </div>
                </div>
              )}
              
              {signatureMode === 'type' && (
                <div className="signature-type-panel">
                  <input
                    type="text"
                    className="signature-type-input"
                    placeholder="Type your name or signature"
                    value={typedSignature}
                    onChange={handleTypedSignatureChange}
                    maxLength={100}
                    autoComplete="off"
                    autoCapitalize="off"
                  />
                  {typedSignature && (
                    <div className="signature-preview">
                      <p>Preview:</p>
                      <div className="signature-preview-text">{typedSignature}</div>
                    </div>
                  )}
                  <div className="signature-panel-buttons">
                    <button 
                      className="primary-button"
                      onClick={handleTypedSignatureSave}
                      disabled={!typedSignature}
                    >
                      Save Signature
                    </button>
                  </div>
                </div>
              )}
              
              {signatureMode === 'upload' && (
                <div className="signature-upload-panel">
                  <p>Upload an image of your signature (PNG, JPG, GIF)</p>
                  <input
                    ref={signatureImageInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif"
                    onChange={handleSignatureImageUpload}
                    style={{ display: 'none' }}
                    aria-label="Select signature image"
                  />
                  <button 
                    className="upload-button"
                    onClick={() => signatureImageInputRef.current?.click()}
                  >
                    Select Image
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {/* Saved Signature Display with Place Button */}
      {savedSignature && (
        <div className="saved-signature-display">
          <div className="saved-signature-content">
            <p>Saved Signature:</p>
            <img src={savedSignature} alt="Saved Signature" />
          </div>
          <button 
            className="place-signature-btn"
            onClick={placeSignature}
            aria-label="Place signature on PDF"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Place</span>
          </button>
        </div>
      )}
    </>
  );
};

export default SignaturePanel;
