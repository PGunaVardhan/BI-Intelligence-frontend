import React, { useState, useRef } from 'react';
import './Sources.css';

const Sources = ({ uploadedFiles, onFilesUploaded, isCollapsed, onToggleCollapse }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [expandedFile, setExpandedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFileUpload(files);
  };

  const handleFileUpload = async (files) => {
    if (files.length > 1000) {
      alert('Maximum 1000 files allowed');
      return;
    }

    if (files.length === 0) {
      alert('Please select at least one file');
      return;
    }

    try {
      setIsUploading(true);
      console.log('🔧 Starting file upload...', files.length, 'files');
      
      // Create FormData and append files
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
        console.log('🔧 Adding file:', file.name, file.type, file.size);
      });

      // Upload to backend
      const response = await fetch('http://localhost:3001/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('🔧 Upload response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('🔧 Upload successful:', result);
      
      // Update parent component with uploaded files
      onFilesUploaded(result.files);
      setShowUploadModal(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      alert(`Successfully uploaded ${result.files.length} files!`);
      
    } catch (error) {
      console.error('🔧 Upload failed:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const iconMap = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      csv: '📊',
      ppt: '📊',
      pptx: '📊',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      mp4: '🎥',
      avi: '🎥',
      mov: '🎥',
      mp3: '🎵',
      wav: '🎵',
      txt: '📄'
    };
    return iconMap[extension] || '📄';
  };

  if (isCollapsed) {
    return (
      <div className="sources-container collapsed">
        <button className="toggle-btn" onClick={onToggleCollapse}>
          →
        </button>
      </div>
    );
  }

  return (
    <div className="sources-container">
      <div className="sources-header">
        <h2>Sources</h2>
        <div className="sources-actions">
          <button className="add-btn" onClick={() => setShowUploadModal(true)} disabled={isUploading}>
            {isUploading ? 'Uploading...' : '+ Add'}
          </button>
          <button className="discover-btn">
            🔍 Discover
          </button>
          <button className="toggle-btn" onClick={onToggleCollapse}>
            ←
          </button>
        </div>
      </div>

      <div className="sources-content">
        {uploadedFiles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <p className="empty-title">Saved sources will appear here</p>
            <p className="empty-description">
              Click Add source above to add PDFs, websites, text, videos, or audio files. Or import a file directly from Google Drive.
            </p>
          </div>
        ) : (
          <div className="file-list">
            <div className="upload-summary">
              <p>📁 {uploadedFiles.length} files uploaded</p>
            </div>
            {uploadedFiles.map((file) => (
              <div key={file.id} className="file-item">
                <div 
                  className="file-header"
                  onClick={() => setExpandedFile(expandedFile === file.id ? null : file.id)}
                >
                  <span className="file-icon">{getFileIcon(file.name)}</span>
                  <span className="file-name">{file.name}</span>
                  <span className="expand-icon">
                    {expandedFile === file.id ? '▼' : '▶'}
                  </span>
                </div>
                
                {expandedFile === file.id && (
                  <div className="file-details">
                    <div className="file-meta">
                      <p><strong>Size:</strong> {formatFileSize(file.size)}</p>
                      <p><strong>Type:</strong> {file.type || 'Unknown'}</p>
                      <p><strong>Uploaded:</strong> {new Date(file.uploadedAt).toLocaleString()}</p>
                      <p><strong>ID:</strong> {file.id}</p>
                    </div>
                    <div className="file-description">
                      <h4>Description</h4>
                      <p>File ready for processing. You can now chat about this file in the Chat panel.</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Upload Files</h3>
            <div 
              className={`upload-area ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="upload-content">
                <div className="upload-icon">📁</div>
                <p>Drag and drop files here</p>
                <p>or</p>
                <button 
                  className="file-select-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Choose Files'}
                </button>
                <p className="upload-note">Upload up to 1000 files</p>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileSelect}
              accept="*/*"
            />
            
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowUploadModal(false)}
                disabled={isUploading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sources;