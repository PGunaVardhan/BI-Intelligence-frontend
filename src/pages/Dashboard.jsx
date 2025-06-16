import React, { useState, useEffect } from 'react';
import Sources from '../dashboard-components/Sources';
import Chat from '../dashboard-components/Chat';
import Studio from '../dashboard-components/Studio';
import ModelSelector from '../dashboard-components/ModelSelector';
import './Dashboard.css';

const Dashboard = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSourcesCollapsed, setIsSourcesCollapsed] = useState(false);
  const [isStudioCollapsed, setIsStudioCollapsed] = useState(false);
  const [currentModel, setCurrentModel] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking...');

  useEffect(() => {
    // Test API connection
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/health');
      if (response.ok) {
        const data = await response.json();
        setApiStatus(`✅ ${data.status}`);
      } else {
        setApiStatus('❌ API Error');
      }
    } catch (error) {
      setApiStatus('❌ Connection Failed');
      console.error('API connection failed:', error);
    }
  };

  const handleFilesUploaded = (files) => {
    setUploadedFiles(prev => [...prev, ...files]);
    console.log('Files uploaded:', files.length);
  };

  const handleModelChange = (modelId, modelName) => {
    setCurrentModel(modelId);
    console.log(`Model switched to: ${modelName} (${modelId})`);
  };

  return (
    <div className="dashboard">
      {/* Fixed Header */}
      <header className="dashboard-header">
        <h1>BI Intelligence</h1>
        <div className="header-status">
          <div style={{ 
            fontSize: '0.9rem', 
            color: apiStatus.includes('✅') ? '#4caf50' : '#ff4444' 
          }}>
            Backend: {apiStatus}
          </div>
          {currentModel && (
            <div style={{ 
              fontSize: '0.8rem', 
              color: '#4285f4',
              marginTop: '0.25rem'
            }}>
              Model: {currentModel}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Sources Panel */}
        <div className={`sources-panel ${isSourcesCollapsed ? 'collapsed' : ''}`}>
          {!isSourcesCollapsed && (
            <>
              <ModelSelector 
                currentModel={currentModel}
                onModelChange={handleModelChange}
              />
              <div className="panel-divider"></div>
            </>
          )}
          <Sources 
            uploadedFiles={uploadedFiles}
            onFilesUploaded={handleFilesUploaded}
            isCollapsed={isSourcesCollapsed}
            onToggleCollapse={() => setIsSourcesCollapsed(!isSourcesCollapsed)}
          />
        </div>

        {/* Chat Panel */}
        <div className="chat-panel">
          <Chat 
            hasUploadedFiles={uploadedFiles.length > 0}
            onFilesUploaded={handleFilesUploaded}
            uploadedFiles={uploadedFiles}
          />
        </div>

        {/* Studio Panel */}
        <div className={`studio-panel ${isStudioCollapsed ? 'collapsed' : ''}`}>
          <Studio 
            isCollapsed={isStudioCollapsed}
            onToggleCollapse={() => setIsStudioCollapsed(!isStudioCollapsed)}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;