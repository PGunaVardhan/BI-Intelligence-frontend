import React, { useState, useRef, useEffect } from 'react';
import './Chat.css';

const Chat = ({ hasUploadedFiles, onFilesUploaded, uploadedFiles = [] }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatMessagesRef = useRef(null);
  const fileInputRef = useRef(null);
  const conversationId = useRef(`conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !hasUploadedFiles || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      console.log('🔧 Sending chat message:', inputValue);
      console.log('🔧 With files:', uploadedFiles.length);

      // Send message to backend
      const response = await fetch('http://localhost:3001/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          conversationId: conversationId.current,
          files: uploadedFiles
        }),
      });

      console.log('🔧 Chat response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Chat failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('🔧 Chat result:', result);
      
      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        text: result.message.text,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        toolsUsed: result.toolsUsed || []
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (result.toolsUsed && result.toolsUsed.length > 0) {
        console.log('🔧 Tools used:', result.toolsUsed);
      }
      
    } catch (error) {
      console.error('🔧 Chat failed:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        text: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

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

    try {
      console.log('🔧 Uploading files from chat:', files.length);
      
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('http://localhost:3001/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      onFilesUploaded(result.files);
      setShowUploadModal(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('🔧 Upload failed:', error);
      alert('Upload failed. Please try again.');
    }
  };

  return (
    <div className={`chat-container ${isDragOver ? 'drag-over' : ''}`}>
      {!hasUploadedFiles ? (
        // Empty state when no files uploaded
        <div className="chat-empty-state">
          <div className="empty-content">
            <div className="upload-icon">⬆️</div>
            <h2>Add a source to get started</h2>
            <button 
              className="upload-source-btn"
              onClick={() => setShowUploadModal(true)}
            >
              Upload a source
            </button>
          </div>
        </div>
      ) : (
        // Chat interface when files are uploaded
        <div className="chat-active">
          <div className="chat-messages" ref={chatMessagesRef}>
            {messages.length === 0 ? (
              <div className="welcome-message">
                <p>Great! You have {uploadedFiles.length} file(s) uploaded. You can now start chatting about them.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`message ${message.sender}`}>
                  <div className="message-content">
                    {message.text}
                    {message.error && <span className="error-indicator"> ⚠️</span>}
                    {message.toolsUsed && message.toolsUsed.length > 0 && (
                      <div className="tools-used">
                        <small>Tools used: {message.toolsUsed.join(', ')}</small>
                      </div>
                    )}
                  </div>
                  <div className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="message ai">
                <div className="message-content typing">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  AI is analyzing your files and generating a response...
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Input - Always at bottom */}
      <div className="chat-input-container">
        <form onSubmit={handleSendMessage} className="chat-form">
          <div className="input-wrapper">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={hasUploadedFiles ? "Ask me anything about your uploaded files..." : "Upload a source to get started"}
              disabled={!hasUploadedFiles}
              className="chat-input"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />
            <button 
              type="submit" 
              className="send-button"
              disabled={!hasUploadedFiles || !inputValue.trim() || isLoading}
            >
              {isLoading ? <div className="spinner"></div> : '➤'}
            </button>
          </div>
        </form>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Upload Source</h3>
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
                >
                  Choose Files
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

export default Chat;
