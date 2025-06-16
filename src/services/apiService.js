// frontend/src/services/apiService.js (Fixed for React)
const API_BASE_URL = 'http://localhost:3001'; // Fixed URL without process.env

console.log('🔧 API Base URL:', API_BASE_URL);

class ApiService {
  constructor() {
    this.socket = null;
    this.conversationId = this.generateConversationId();
    console.log('🔧 ApiService initialized with conversation ID:', this.conversationId);
  }

  generateConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Health check
  async healthCheck() {
    try {
      console.log('🔧 Testing health check...');
      const response = await fetch(`${API_BASE_URL}/api/health`);
      const result = await response.json();
      console.log('🔧 Health check result:', result);
      return result;
    } catch (error) {
      console.error('🔧 Health check error:', error);
      return { status: 'unhealthy', error: error.message };
    }
  }

  // Upload files to backend
  async uploadFiles(files) {
    try {
      console.log('🔧 Uploading files:', files.length);
      
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('🔧 Upload result:', result);
      return result.files;
    } catch (error) {
      console.error('🔧 File upload error:', error);
      throw error;
    }
  }

  // Send chat message to backend
  async sendMessage(message, uploadedFiles = []) {
    try {
      console.log('🔧 Sending message:', message);
      
      const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationId: this.conversationId,
          files: uploadedFiles
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('🔧 Chat result:', result);
      return result;
    } catch (error) {
      console.error('🔧 Chat error:', error);
      throw error;
    }
  }

  // Get available models
  async getAvailableModels() {
    try {
      console.log('🔧 Getting available models...');
      const response = await fetch(`${API_BASE_URL}/api/models/available`);
      
      if (!response.ok) {
        throw new Error(`Failed to get models: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('🔧 Available models:', result);
      return result;
    } catch (error) {
      console.error('🔧 Error getting available models:', error);
      throw error;
    }
  }

  // Switch to a different model
  async switchModel(modelId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/models/switch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ modelId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to switch model: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error switching model:', error);
      throw error;
    }
  }

  // Set API key for a model
  async setApiKey(modelId, apiKey) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/models/api-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ modelId, apiKey }),
      });

      if (!response.ok) {
        throw new Error(`Failed to set API key: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error setting API key:', error);
      throw error;
    }
  }

  // Test a model
  async testModel(modelId, testPrompt = 'Hello, please respond with "OK"') {
    try {
      const response = await fetch(`${API_BASE_URL}/api/models/test/${modelId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testPrompt }),
      });

      if (!response.ok) {
        throw new Error(`Model test failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error testing model:', error);
      throw error;
    }
  }

  // Get current model
  async getCurrentModel() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/models/current`);
      
      if (!response.ok) {
        throw new Error(`Failed to get current model: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting current model:', error);
      throw error;
    }
  }

  // Get conversation history
  async getConversationHistory() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/history/${this.conversationId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get history: ${response.statusText}`);
      }

      const result = await response.json();
      return result.messages || [];
    } catch (error) {
      console.error('🔧 Error getting conversation history:', error);
      return [];
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

// Test connection on load
apiService.healthCheck().then(result => {
  console.log('🔧 Initial health check:', result.status);
}).catch(error => {
  console.error('🔧 Initial health check failed:', error);
});

export default apiService;