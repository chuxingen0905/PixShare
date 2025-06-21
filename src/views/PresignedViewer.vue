<template>
  <div class="presigned-viewer">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner">
        <svg class="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <p class="loading-text">Loading content...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">
        <svg class="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.348 18.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 class="error-title">Content Not Available</h2>
      <p class="error-message">{{ error }}</p>
      <button @click="retry" class="retry-button">
        Try Again
      </button>
    </div>

    <!-- Success State - Image Display -->
    <div v-else-if="presignedUrl" class="content-container">
      <div class="content-header">
        <h2 class="content-title">Shared Content</h2>        <div class="content-info">
          <span class="header-badge">{{ linkId }}</span>
        </div>
      </div>

      <!-- Image Display -->
      <div class="image-container">        <img 
          :src="presignedUrl" 
          :alt="'Content for ' + linkId"
          class="content-image"
          @load="onImageLoad"
          @error="onImageError"
        />
      </div>

      <!-- Image Actions -->
      <div class="image-actions">
        <button @click="downloadImage" class="action-button download-button">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>
        <button @click="openInNewTab" class="action-button view-button">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open in New Tab
        </button>
      </div>

      <!-- Debug Info (only in development) -->
      <div v-if="showDebugInfo" class="debug-info">
        <h3 class="debug-title">Debug Information</h3>        <div class="debug-content">
          <p><strong>Link ID:</strong> {{ linkId }}</p>
          <p><strong>Presigned URL:</strong> {{ presignedUrl.substring(0, 100) }}...</p>
          <p><strong>Loaded at:</strong> {{ loadedAt }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getPresignedUrl } from '../services/presignedUrlService.js';

export default {
  name: 'PresignedViewer',  data() {
    return {
      linkId: '',
      presignedUrl: '',
      isLoading: false,
      error: '',
      loadedAt: '',
      showDebugInfo: process.env.NODE_ENV === 'development'
    }
  },
  async created() {
    // Get the link ID from URL parameters (supports both 'linkId' and 'header' for backward compatibility)
    this.linkId = this.$route.query.linkId || this.$route.query.header || this.$route.params.linkId || this.$route.params.header;
    
    if (!this.linkId) {
      this.error = 'No link ID provided in URL. Please include the linkId parameter.';
      return;
    }

    console.log('🔍 PresignedViewer loaded with link ID:', this.linkId);
    
    // Load the presigned URL
    await this.loadPresignedUrl();
  },
  methods: {    async loadPresignedUrl() {
      this.isLoading = true;
      this.error = '';
      
      try {
        console.log('🚀 Loading presigned URL for link ID:', this.linkId);
        
        const result = await getPresignedUrl(this.linkId);
        
        if (result.success) {
          this.presignedUrl = result.presignedUrl;
          this.loadedAt = new Date().toLocaleString();
          console.log('✅ Presigned URL loaded successfully');
        } else {
          this.error = result.error || 'Failed to load content';
          console.error('❌ Failed to load presigned URL:', result.error);
        }
        
      } catch (error) {
        this.error = error.message || 'An unexpected error occurred';
        console.error('❌ Error loading presigned URL:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    async retry() {
      await this.loadPresignedUrl();
    },
    
    onImageLoad() {
      console.log('✅ Image loaded successfully');
    },
    
    onImageError() {
      this.error = 'Failed to load the image. The presigned URL may have expired.';
      console.error('❌ Image failed to load');
    },
      downloadImage() {
      if (this.presignedUrl) {
        const link = document.createElement('a');
        link.href = this.presignedUrl;
        link.download = `content-${this.linkId}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
    
    openInNewTab() {
      if (this.presignedUrl) {
        window.open(this.presignedUrl, '_blank');
      }
    }
  }
}
</script>

<style scoped>
.presigned-viewer {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: white;
}

.loading-spinner {
  margin-bottom: 20px;
}

.loading-text {
  font-size: 18px;
  font-weight: 500;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: white;
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
}

.error-icon {
  margin-bottom: 20px;
}

.error-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.error-message {
  font-size: 16px;
  margin-bottom: 30px;
  opacity: 0.9;
}

.retry-button {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.content-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.content-info {
  display: flex;
  align-items: center;
}

.header-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-family: monospace;
  font-size: 14px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.image-container {
  padding: 30px;
  text-align: center;
  background: #f8f9fa;
}

.content-image {
  max-width: 100%;
  max-height: 70vh;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.content-image:hover {
  transform: scale(1.02);
}

.image-actions {
  padding: 20px 30px;
  background: white;
  border-top: 1px solid #eee;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.action-button {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.download-button {
  background: #28a745;
  color: white;
}

.download-button:hover {
  background: #218838;
}

.view-button {
  background: #007bff;
  color: white;
}

.view-button:hover {
  background: #0056b3;
}

.debug-info {
  background: #f8f9fa;
  border-top: 1px solid #eee;
  padding: 20px 30px;
}

.debug-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #6c757d;
}

.debug-content {
  font-family: monospace;
  font-size: 12px;
  color: #6c757d;
}

.debug-content p {
  margin: 5px 0;
}

@media (max-width: 768px) {
  .presigned-viewer {
    padding: 10px;
  }
  
  .content-header {
    padding: 15px 20px;
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .image-container {
    padding: 20px;
  }
  
  .image-actions {
    flex-direction: column;
    padding: 15px 20px;
  }
  
  .action-button {
    justify-content: center;
  }
}
</style>
