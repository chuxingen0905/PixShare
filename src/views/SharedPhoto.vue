<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-4">
    <div v-if="loading" class="text-center">
      <div class="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
      <p class="mt-4 text-lg text-blue-700">Loading shared photo...</p>
    </div>
    
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-lg w-full text-center">
      <p class="font-bold">Error</p>
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="photo" class="max-w-4xl w-full bg-white rounded-lg shadow-lg overflow-hidden">
      <!-- Photo Header -->
      <div class="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 class="text-xl font-semibold">Shared Photo</h1>
        <div class="text-sm">
          <span v-if="expiryDate">
            Expires: {{ new Date(expiryDate).toLocaleString() }}
          </span>
        </div>
      </div>
      
      <!-- Photo Display -->
      <div class="p-4">
        <img 
          :src="photo.url" 
          :alt="photo.name" 
          class="max-w-full max-h-[70vh] mx-auto rounded shadow"
        />
        <div class="mt-4 text-center">
          <h2 class="text-xl text-gray-800">{{ photo.name }}</h2>
          <p class="text-sm text-gray-500">Shared by: {{ photo.sharedBy || 'Unknown' }}</p>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="p-4 border-t border-gray-200 flex justify-center space-x-4">
        <button 
          v-if="permissions.includes('download')"
          @click="downloadPhoto"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Download
        </button>
        <button
          v-if="permissions.includes('edit')"
          @click="editPhoto"
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          Edit
        </button>
      </div>
    </div>
    
    <!-- Back Button -->
    <button
      @click="goBack"
      class="mt-6 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
    >
      Back
    </button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SharedPhoto',
  data() {
    return {
      loading: true,
      error: null,
      photo: null,
      permissions: [],
      expiryDate: null,
      shareId: null
    };
  },
  mounted() {
    this.loadSharedPhoto();
  },  methods: {
    async loadSharedPhoto() {
      this.loading = true;
      try {
        // Get photoId and shareId from the route
        const photoId = this.$route.params.id;
        const shareId = this.$route.query.id;
        this.shareId = shareId;
        
        console.log('Loading shared photo:', photoId, 'with share ID:', shareId);
        
        if (!photoId || !shareId) {
          throw new Error('Invalid share link');
        }
        
        // Simple mock data instead of API call
        const response = null;
        
        // For testing, use mock data if API call fails
        if (!response) {
          this.photo = {
            name: photoId,
            url: `/assets/${photoId}`,
            sharedBy: 'User'
          };
          this.permissions = ['view']; // Default permission
          this.expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        } else {
          this.photo = {
            name: response.name || photoId,
            url: response.url || `/assets/${photoId}`,
            sharedBy: response.sharedBy || 'User'
          };
          this.permissions = response.permission ? [response.permission] : ['view'];
          this.expiryDate = response.expiryDate;
        }
      } catch (err) {
        console.error('Error loading shared photo:', err);
        this.error = err.message || 'Failed to load the shared photo';
      } finally {
        this.loading = false;
      }
    },
      async getSharedPhotoDetails(photoId, shareId) {
      try {
        // Import the real share service
        const shareServiceModule = await import('../services/shareService.js');
        const shareService = shareServiceModule.default;
        
        // API Gateway URL
        const API_ENDPOINT = 'https://fk96bt7fv3.execute-api.ap-southeast-5.amazonaws.com/pixDeployment';
        
        // First try using the shareService
        try {
          console.log('Attempting to get share details using shareService...');
          const response = await shareService.getPhotoShares(photoId);
          
          // Find the specific share by ID
          const shareDetails = response.find(share => share.shareId === shareId);
          if (shareDetails) {
            console.log('Share found:', shareDetails);
            return shareDetails;
          }
        } catch (e) {
          console.warn('Error using shareService:', e);
        }
        
        // Fallback to direct API call if shareService didn't work
        console.log('Falling back to direct API call...');
        const response = await axios.get(`${API_ENDPOINT}/photos/sharing/${shareId}`);
        console.log('API response:', response.data);
        return response.data;
      } catch (err) {
        console.error('API Error:', err);
        // Return null to trigger mock data use
        return null;
      }
    },
    
    downloadPhoto() {
      if (!this.photo || !this.photo.url) return;
      
      const link = document.createElement('a');
      link.href = this.photo.url;
      link.download = this.photo.name || 'shared-photo.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    
    editPhoto() {
      // Navigate to editor with the photo data
      this.$router.push({
        name: 'Editor',
        query: {
          photo: this.photo.url,
          name: this.photo.name,
          shared: 'true',
          shareId: this.shareId
        }
      });
    },
    
    goBack() {
      // If user navigated from within the app, go back
      if (window.history.length > 2) {
        this.$router.go(-1);
      } else {
        // Otherwise go to login
        this.$router.push('/login');
      }
    }
  }
};
</script>
