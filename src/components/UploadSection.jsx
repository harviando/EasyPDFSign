import { useRef, useState } from 'react';

const UploadSection = ({ 
  isLoading, 
  error, 
  onFileUpload
}) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event) => {
    if (onFileUpload) {
      onFileUpload(event);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    
    const dt = event.dataTransfer;
    const files = dt.files;
    
    if (files.length === 0) {
      return;
    }
    
    const file = files[0];
    
    // Create a mock event object similar to what input change provides
    const mockEvent = {
      target: {
        files: [file]
      }
    };
    
    if (onFileUpload) {
      onFileUpload(mockEvent);
    }
  };

  const handleContainerClick = (e) => {
    // Prevent triggering if clicking on the button (to avoid double-trigger)
    if (e.target.classList.contains('upload-button')) {
      return;
    }
    handleClick();
  };

  return (
    <div 
      className={`upload-section ${isDragging ? 'dragging' : ''}`} 
      onDragOver={handleDragOver} 
      onDragLeave={handleDragLeave} 
      onDrop={handleDrop}
      onClick={handleContainerClick}
      style={{ cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      aria-label="Upload PDF file"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className={`upload-container ${isDragging ? 'drag-active' : ''}`}>
        <div className="upload-icon" aria-hidden="true">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Document outline */}
            <path 
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill="none"
            />
            {/* Folded corner */}
            <path 
              d="M14 2v6h6" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill="none"
            />
            {/* Upload arrow */}
            <path 
              d="M12 11v6" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M9 14l3-3 3 3" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
        
        <h2>Upload your PDF</h2>
        <p>Drag and drop your file here, or click anywhere to browse</p>
        <p className="file-limit">Maximum file size: 10MB • PDF files only</p>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          onClick={(e) => e.stopPropagation()}
          style={{ display: 'none' }}
          aria-label="Select PDF file"
        />

        <button 
          className="upload-button"
          onClick={handleClick}
          disabled={isLoading}
          type="button"
        >
          {isLoading ? 'Loading...' : 'Select PDF File'}
        </button>
      </div>
    </div>
  );
};

export default UploadSection;
