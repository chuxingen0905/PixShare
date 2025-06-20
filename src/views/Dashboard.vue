<template>
  <div class="flex min-h-screen bg-blue-50">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="flex-1 px-6 py-4">
      
      <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-blue-900">My Photos</h1>
      <div class="flex items-center space-x-4">
        <input
          type="file"
          multiple
          @change="handleFileUpload"
          class="hidden"
          ref="fileInput"
        />
        <button
          @click="$refs.fileInput.click()"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Upload
        </button>
        <button
          @click="handleLogout"
          class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>

      <!-- Drag-and-Drop Area -->
      <div
        class="border-2 border-dashed border-blue-200 bg-blue-100 text-blue-700 rounded-lg p-8 mb-6 text-center"
        @dragover.prevent
        @drop.prevent="handleDrop"
      >
        Drag and drop images here, or click the Upload button
      </div>

      <!-- Search Bar -->
      <div class="mb-4 relative w-full">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by file name..."
          class="w-full px-4 py-2 pr-10 border border-blue-200 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          @click="searchPhotos"
          class="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-500 hover:text-blue-700"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z" />
          </svg>
        </button>
      </div>

      <!-- Share Modal -->
      <div v-if="isShareModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Share Photo</h2>
            <button @click="closeShareModal" class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
            <input 
              type="datetime-local" 
              v-model="shareExpiryDate" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              :min="new Date().toISOString().slice(0, 16)"
            >
          </div>
          
          <div v-if="shareLink" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Share Link</label>
            <div class="flex">
              <input 
                type="text" 
                :value="shareLink" 
                readonly 
                class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-100"
                ref="shareLinkInput"
              >
              <button 
                @click="copyShareLink"
                class="bg-blue-500 text-white px-3 py-2 rounded-r-md hover:bg-blue-600 transition"
              >
                Copy
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1">Expires: {{ formatExpiryDate(shareExpiryDate) }}</p>
          </div>
          
          <div class="flex justify-end space-x-2">
            <button 
              @click="closeShareModal" 
              class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button 
              @click="generateShareLink" 
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              :disabled="!sharePermissions.view && !sharePermissions.edit && !sharePermissions.download"
            >
              Generate Link
            </button>
          </div>
          
          <div v-if="sharedLinks.length > 0" class="mt-6">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Active Shared Links</h3>
            <ul class="space-y-2 max-h-40 overflow-y-auto">
              <li v-for="(link, index) in sharedLinks" :key="index" class="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <p class="text-xs text-gray-500">Expires: {{ formatExpiryDate(link.expiry) }}</p>
                  <p class="text-xs text-blue-500 truncate">{{ link.url }}</p>
                </div>
                <button @click="revokeShareLink(index)" class="text-red-500 hover:text-red-700">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Photo Viewer Modal -->
      <PhotoViewer
        v-if="selectedPhoto && isViewerOpen && !isShareModalOpen"
        :visible="isViewerOpen"
        :photo="selectedPhoto"
        @close="isViewerOpen = false"
        @download="downloadPhoto"
        @edit="goToEditor"
        @share="openShareModal"
        @delete="deletePhoto"
      />

      <!-- Photo Grid -->
      <div v-if="filteredPhotos.length === 0" class="text-center text-blue-500 text-lg mt-16">
        No photos found. Upload or change your search.
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div
          v-for="(photo, index) in filteredPhotos"
          :key="index"
          @click="openViewer(photo)"
          class="relative group cursor-pointer aspect-square overflow-hidden bg-blue-100 rounded-lg shadow hover:shadow-lg transition"
        >
          <img
            :src="photo.url"
            :alt="photo.name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div v-if="photo.shared" class="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue';
import PhotoViewer from '../views/PhotoViewer.vue';
import GroupManagement from '../views/GroupManagement.vue'

export default {
  components: { Sidebar, PhotoViewer, GroupManagement },  data() {
    return {
      photos: [], // Empty array, will fetch from AWS
      searchQuery: '',
      selectedPhoto: null,
      isViewerOpen: false,
      isShareModalOpen: false,
      shareLink: '',
      shareExpiryDate: '',
      sharePermissions: {
        view: true,
        edit: false,
        download: false
      },
      sharedLinks: []
    };
  },
  computed: {
    filteredPhotos() {
      if (!this.searchQuery) return this.photos;
      return this.photos.filter(photo =>
        photo.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },  methods: {
    async handleLogout() {
      try {
        // Import auth service
        const authService = await import('../services/auth.js').then(module => module.default);
        
        // Call the proper logout method
        const result = await authService.logout();
        
        if (result.success) {
          // Also clear any local storage items
          localStorage.removeItem('user');
          
          // Redirect to login page
          this.$router.push('/login');
        } else {
          console.error('Logout failed:', result.error);
          alert('Logout failed. Please try again.');
        }
      } catch (error) {
        console.error('Logout error:', error);
        alert('An error occurred during logout. Please try again.');
      }
    },
    handleFileUpload(event) {
      const files = Array.from(event.target.files);
      this.loadPhotos(files);
      this.$refs.fileInput.value = null;
    },
    handleDrop(event) {
      const files = Array.from(event.dataTransfer.files);
      this.loadPhotos(files);
    },
    loadPhotos(files) {
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();

          reader.onload = async (e) => {
            const base64Image = e.target.result.split(',')[1]; // Only base64

            try {
              const authService = await import('../services/auth.js').then(module => module.default);

              // Ensure token is valid
              await authService.ensureValidToken();
              const token = authService.getIdToken();
              if (!token) {
                console.error("Token is null. User may not be logged in.");
                return;
              }

              // Get current user ID
              const user = await authService.getCurrentUser();
              if (!user || !user.id) {
                console.error("Missing user ID");
                return;
              }

              // Upload to backend
              const response = await fetch('https://fk96bt7fv3.execute-api.ap-southeast-5.amazonaws.com/pixDeployment/photos', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userId: user.id,
                  photoName: file.name,
                  photoBase64: base64Image,
                  metadata: {
                    size: file.size,
                    type: file.type
                  }
                }),
              });

              if (!response.ok) {
                const errorText = await response.text();
                console.error("Upload failed:", errorText);
                throw new Error(`Upload failed with status ${response.status}`);
              }

              // ✅ Parse successful result
              const result = await response.json();
              console.log("✅ Uploaded successfully:", result);

              // ✅ Add uploaded photo to UI
              this.photos.push({ name: file.name, url: result.url || e.target.result });

            } catch (err) {
              console.error("Upload error:", err);
            }
          };

          reader.readAsDataURL(file);
        }
      });
    },
    openViewer(photo) {
      this.selectedPhoto = {
        name: photo.name,
        src: photo.url || photo.src,
        shared: photo.shared || false
      };
      this.isViewerOpen = true;
    },
    downloadPhoto(photo) {
      const link = document.createElement('a');
      link.href = photo.url;
      link.download = photo.name;
      link.click();
    },
    goToEditor(photo) {
      this.$router.push({ 
        name: 'Editor', 
        query: { 
          photo: photo.originalUrl || photo.url,
          name: photo.name 
        } 
      });
    },
    openShareModal(photo) {
      this.selectedPhoto = photo;
      this.isShareModalOpen = true;
      this.shareLink = '';
      this.shareExpiryDate = this.getDefaultExpiryDate();
      this.loadSharedLinks(photo);
    },
    closeShareModal() {
      this.isShareModalOpen = false;
      this.shareLink = '';
    },
    generateShareLink() {
      // In a real app, this would call your backend API to generate a pre-signed URL
      const baseUrl = window.location.origin;
      const token = this.generateToken();
      const photoId = this.selectedPhoto.name;
      
      // Construct the share link with permissions and expiry
      const permissions = [];
      if (this.sharePermissions.view) permissions.push('view');
      if (this.sharePermissions.edit) permissions.push('edit');
      if (this.sharePermissions.download) permissions.push('download');
      
      this.shareLink = `${baseUrl}/share/${photoId}?token=${token}&perms=${permissions.join(',')}`;
      
      // Store the shared link
      this.sharedLinks.push({
        url: this.shareLink,
        expiry: this.shareExpiryDate,
        permissions: this.sharePermissions,
        token: token
      });
      
      // Mark the photo as shared
      const photoIndex = this.photos.findIndex(p => p.name === this.selectedPhoto.name);
      if (photoIndex !== -1) {
        this.photos[photoIndex].shared = true;
      }
    },
    copyShareLink() {
      this.$refs.shareLinkInput.select();
      document.execCommand('copy');
      this.$toast.success('Link copied to clipboard!');
    },
    revokeShareLink(index) {
      this.sharedLinks.splice(index, 1);
      
      // If no more shared links, mark photo as not shared
      if (this.sharedLinks.length === 0) {
        const photoIndex = this.photos.findIndex(p => p.name === this.selectedPhoto.name);
        if (photoIndex !== -1) {
          this.photos[photoIndex].shared = false;
        }
      }
    },
    loadSharedLinks(photo) {
      // In a real app, this would fetch from your backend
      this.sharedLinks = [];
      
      // Mock data for demonstration
      if (photo.shared) {
        this.sharedLinks.push({
          url: `${window.location.origin}/share/${photo.name}?token=mock123`,
          expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          permissions: { view: true, edit: false, download: false },
          token: 'mock123'
        });
      }
    },
    generateToken() {
      // In a real app, this would be generated by your backend
      return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    },
    getDefaultExpiryDate() {
      const date = new Date();
      date.setDate(date.getDate() + 7); // Default to 7 days from now
      return date.toISOString().slice(0, 16);
    },
    formatExpiryDate(dateString) {
      if (!dateString) return 'Never';
      const date = new Date(dateString);
      return date.toLocaleString();
    },
    deletePhoto(photo) {
      this.photos = this.photos.filter(p => p.name !== photo.name);
      this.isViewerOpen = false;
    },
    async fetchUserPhotos() {
      try {
        // Step 1: Fetch photo metadata (with photoId) from backend
        const metaResponse = await fetch('https://fk96bt7fv3.execute-api.ap-southeast-5.amazonaws.com/pixDeployment/profile/images', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('cognito_id_token')}`,
            'Content-Type': 'application/json',
          },
        });
        if (!metaResponse.ok) {
          const errorText = await metaResponse.text();
          console.error(`Failed to fetch photo metadata: ${metaResponse.status}`, errorText);
          throw new Error(`Failed to fetch photo metadata: ${metaResponse.status}`);
        }
        const metaResult = await metaResponse.json();
        if (!metaResult.images || !Array.isArray(metaResult.images)) {
          console.error("Invalid API response format - 'images' array missing or not an array", metaResult);
          return;
        }
        const photoIds = metaResult.images.map(photo => photo.photoId);
        if (!photoIds.length) {
          this.photos = [];
          return;
        }
        // Step 2: Request presigned URLs from backend
        const urlResponse = await fetch('https://fk96bt7fv3.execute-api.ap-southeast-5.amazonaws.com/pixDeployment/photos/display', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('cognito_id_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ photoIds })
        });
        if (!urlResponse.ok) {
          const errorText = await urlResponse.text();
          console.error(`Failed to fetch presigned URLs: ${urlResponse.status}`, errorText);
          throw new Error(`Failed to fetch presigned URLs: ${urlResponse.status}`);
        }
        const urlResult = await urlResponse.json();
        const urlArray = urlResult.urls || [];
        const urlMap = Object.fromEntries(urlArray.map(p => [p.photoId, p.signedUrl]));
        this.photos = metaResult.images.map(photo => ({
          ...photo,
          url: urlMap[photo.photoId] || '',
        }));
        console.log("Final photos with backend presigned URLs:", this.photos);
      } catch (error) {
        console.error("Failed to fetch photos:", error);
      }
    },
  },
  async mounted() {
    // Check authentication
    try {
      const authService = await import('../services/auth.js').then(module => module.default);
      const token = authService.getIdToken();
      if (!token) {
        console.warn('Not authenticated, redirecting to login');
        this.$router.push('/login');
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      this.$router.push('/login');
    }
  },
  created() {
    if (this.$route.query.editedPhoto) {
      const photoName = this.$route.query.originalName;
      const existingIndex = this.photos.findIndex(p => p.name === photoName);
      
      if (existingIndex !== -1) {
        this.photos[existingIndex].url = this.$route.query.editedPhoto;
        this.photos[existingIndex].originalUrl = this.$route.query.editedPhoto;
      } else {
        this.photos.push({
          name: photoName,
          url: this.$route.query.editedPhoto,
          originalUrl: this.$route.query.editedPhoto
        });
      }
    }

    // Fetch user photos on load
    this.fetchUserPhotos();
  }
};
</script>

<style scoped>
.btn {
  @apply bg-white text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-100;
}
</style>