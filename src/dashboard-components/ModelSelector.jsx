import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import './ModelSelector.css';

const ModelSelector = ({ onModelChange, currentModel }) => {
  const [availableModels, setAvailableModels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadAvailableModels();
  }, []);

  const loadAvailableModels = async () => {
    try {
      const response = await apiService.getAvailableModels();
      setAvailableModels(response.models);
      
      // Set current model if not set
      if (!currentModel && response.currentModel) {
        onModelChange?.(response.currentModel, 
          response.models.find(m => m.id === response.currentModel)?.name
        );
      }
    } catch (error) {
      console.error('Failed to load models:', error);
      setError('Failed to load available models');
    }
  };

  const handleModelSwitch = async (modelId) => {
    const model = availableModels.find(m => m.id === modelId);
    
    if (model.requires_api_key && model.type === 'api') {
      setSelectedModel(model);
      setShowApiKeyModal(true);
      setShowDropdown(false);
      return;
    }

    await switchModel(modelId);
    setShowDropdown(false);
  };

  const switchModel = async (modelId) => {
    try {
      setIsLoading(true);
      setError('');
      
      await apiService.switchModel(modelId);
      
      const modelName = availableModels.find(m => m.id === modelId)?.name;
      onModelChange?.(modelId, modelName);
      
    } catch (error) {
      console.error('Failed to switch model:', error);
      setError('Failed to switch model');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeySubmit = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Set API key
      await apiService.setApiKey(selectedModel.id, apiKey);
      
      // Switch to the model
      await switchModel(selectedModel.id);
      
      setShowApiKeyModal(false);
      setApiKey('');
      setSelectedModel(null);
      
    } catch (error) {
      console.error('Failed to set API key:', error);
      setError('Invalid API key or failed to authenticate');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentModelName = () => {
    const model = availableModels.find(m => m.id === currentModel);
    return model ? model.name : 'Select Model';
  };

  const getCurrentModelStatus = () => {
    const model = availableModels.find(m => m.id === currentModel);
    if (!model) return '❓';
    if (model.type === 'local') return '🟢';
    if (model.available) return '🔵';
    return '🔴';
  };

  return (
    <div className="model-selector">
      <div className="model-selector-header">
        <h3>AI Model</h3>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Model Dropdown */}
      <div className="model-dropdown-container">
        <div 
          className={`model-dropdown-trigger ${showDropdown ? 'active' : ''}`}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="current-model-display">
            <span className="model-status">{getCurrentModelStatus()}</span>
            <span className="model-name">{getCurrentModelName()}</span>
            <span className="dropdown-arrow">{showDropdown ? '▲' : '▼'}</span>
          </div>
        </div>

        {showDropdown && (
          <div className="model-dropdown-menu">
            {availableModels.map((model) => (
              <div 
                key={model.id}
                className={`model-dropdown-item ${currentModel === model.id ? 'selected' : ''} ${!model.available ? 'unavailable' : ''}`}
                onClick={() => handleModelSwitch(model.id)}
              >
                <div className="model-item-content">
                  <div className="model-item-header">
                    <span className="model-status">
                      {model.type === 'local' ? '🟢' : model.available ? '🔵' : '🔴'}
                    </span>
                    <span className="model-name">{model.name}</span>
                    <span className="model-type-badge">{model.type}</span>
                  </div>
                  <div className="model-description">{model.description}</div>
                  {model.requires_api_key && !model.available && (
                    <div className="api-key-required">🔑 API Key Required</div>
                  )}
                </div>
                {currentModel === model.id && (
                  <span className="selected-indicator">✓</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>Switching model...</span>
        </div>
      )}

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="modal-overlay" onClick={() => setShowApiKeyModal(false)}>
          <div className="api-key-modal" onClick={(e) => e.stopPropagation()}>
            <h3>API Key Required</h3>
            <p>
              <strong>{selectedModel?.name}</strong> requires an API key to function.
              Please enter your API key below.
            </p>
            
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API key..."
              className="api-key-input"
              onKeyPress={(e) => e.key === 'Enter' && handleApiKeySubmit()}
            />
            
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowApiKeyModal(false)}
              >
                Cancel
              </button>
              <button 
                className="submit-btn"
                onClick={handleApiKeySubmit}
                disabled={!apiKey.trim() || isLoading}
              >
                {isLoading ? 'Setting...' : 'Set API Key & Switch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;