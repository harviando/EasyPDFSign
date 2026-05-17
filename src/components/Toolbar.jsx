

const Toolbar = ({ 
  signatureMode, 
  handleSignatureMode, 
  savedSignature, 
  clearSignature, 
  handleReset, 
  handleDownload, 
  isDownloading,
  placedSignaturesLength 
}) => {
  return (
    <div className="toolbar" role="toolbar" aria-label="PDF signature tools">
      <button 
        className="toolbar-button" 
        onClick={handleReset}
        aria-label="Upload new PDF"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
        <span>New PDF</span>
      </button>
      
      <div className="toolbar-divider" aria-hidden="true"></div>
      
      {/* Signature buttons */}
      <button 
        className={`toolbar-button ${signatureMode === 'draw' ? 'active' : ''}`}
        onClick={() => handleSignatureMode('draw')}
        aria-label="Draw signature"
        aria-pressed={signatureMode === 'draw'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          <path d="M2 2l7.586 7.586" />
          <circle cx="11" cy="11" r="2" />
        </svg>
        <span>Draw</span>
      </button>
      
      <button 
        className={`toolbar-button ${signatureMode === 'type' ? 'active' : ''}`}
        onClick={() => handleSignatureMode('type')}
        aria-label="Type signature"
        aria-pressed={signatureMode === 'type'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <polyline points="4 7 4 4 20 4 20 7" />
          <line x1="9" y1="20" x2="15" y2="20" />
          <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
        <span>Type</span>
      </button>
      
      <button 
        className={`toolbar-button ${signatureMode === 'upload' ? 'active' : ''}`}
        onClick={() => handleSignatureMode('upload')}
        aria-label="Upload signature image"
        aria-pressed={signatureMode === 'upload'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <span>Upload</span>
      </button>
      
      {savedSignature && (
        <button 
          className="toolbar-button" 
          onClick={clearSignature}
          aria-label="Clear saved signature"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          <span>Clear</span>
        </button>
      )}
      
      <div className="toolbar-spacer" aria-hidden="true"></div>
      
      <button 
        className="download-button" 
        onClick={handleDownload}
        disabled={isDownloading}
        aria-label={placedSignaturesLength > 0 ? 'Download signed PDF' : 'Download original PDF'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <span>{placedSignaturesLength > 0 ? 'Download Signed' : 'Download Original'}</span>
      </button>
    </div>
  );
};

export default Toolbar;