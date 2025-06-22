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
        <h1 class="text-xl font-semibold">{{ photo.photoName }}</h1>
        <div class="text-sm">
          <span v-if="photo.expiresAt">
            Expires: {{ new Date(photo.expiresAt).toLocaleString() }}
          </span>
        </div>
      </div>
      
      <!-- Photo Display -->
      <div class="p-4">
        <img 
          :src="photo.photoUrl" 
          :alt="photo.photoName" 
          class="max-w-full max-h-[70vh] mx-auto rounded shadow"
          @error="onImageError"
        />
        <div class="mt-4 text-center">
          <h2 class="text-xl text-gray-800">{{ photo.photoName }}</h2>
          <p class="text-sm text-gray-500" v-if="photo.createdAt">
            Shared on: {{ new Date(photo.createdAt).toLocaleString() }}
          </p>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="p-4 border-t border-gray-200 flex justify-center space-x-4">
        <button 
          v-if="permissions.download"
          @click="downloadPhoto"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Download
        </button>
        <button
          v-if="permissions.edit"
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
import shareService from '../services/shareService.js'

export default {
  name: 'SharedPhoto',
  data() {
    return {
      loading: true,
      error: null,
      photo: null,
      permissions: {
        view: true,
        download: false,
        edit: false
      },
      shareId: null
    };
  },
  mounted() {
    this.loadSharedPhoto();
  },
  methods: {
    async loadSharedPhoto() {
      this.loading = true;
      this.error = null;
      
      try {
        // Get shareId from the route parameter
        this.shareId = this.$route.params.shareId;
        
        console.log('🔄 Loading shared photo for shareId:', this.shareId);
        
        if (!this.shareId) {
          throw new Error('Invalid share link - no share ID found');
        }
        
        // Call the shareService to get the shared photo
        const result = await shareService.getSharedPhoto(this.shareId);
        
        console.log('📥 Share service result:', result);
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to load shared photo');
        }
        
        // Set the photo data
        this.photo = result.photo;
        this.permissions = result.permissions;
        
        console.log('✅ Photo loaded successfully:', this.photo);
        
      } catch (err) {
        console.error('❌ Error loading shared photo:', err);
        this.error = err.message || 'Failed to load the shared photo';
      } finally {
        this.loading = false;
      }
    },
    
    onImageError() {
      console.error('❌ Failed to load image');
      this.error = 'Failed to load the image. The link may have expired.';
    },
    
    downloadPhoto() {
      if (!this.photo || !this.photo.photoUrl) {
        console.warn('No photo URL available for download');
        return;
      }
      
      // Create a temporary link to download the photo
      const link = document.createElement('a');
      link.href = this.photo.photoUrl;
      link.download = this.photo.photoName || 'shared-photo.jpg';
      link.target = '_blank'; // Open in new tab to handle CORS if needed
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    
    editPhoto() {
      // Navigate to editor with the photo data
      this.$router.push({
        name: 'Editor',
        query: {
          photo: this.photo.photoUrl,
          name: this.photo.photoName,
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
