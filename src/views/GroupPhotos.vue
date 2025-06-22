<template>
  <div class="flex min-h-screen h-screen bg-blue-50 overflow-hidden">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="flex-1 px-6 py-4 overflow-y-auto">
      
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <button 
            @click="$router.push('/dashboard')" 
            class="text-blue-500 hover:text-blue-700 mb-2 flex items-center transition"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 class="text-2xl font-semibold text-blue-900">{{ groupName || 'Group Photos' }}</h1>
          <p class="text-sm text-gray-600" v-if="groupDescription">{{ groupDescription }}</p>
        </div>
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
            Upload to Group
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
        <svg class="w-12 h-12 mx-auto mb-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        Drag and drop images here to upload to this group, or click the Upload button
      </div>

      <!-- Search Bar -->
      <div class="mb-4 relative w-full">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search group photos by file name..."
          class="w-full px-4 py-2 pr-10 border border-blue-200 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          @click="searchGroupPhotos"
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
            <h2 class="text-xl font-semibold">Share Group Photo</h2>
            <button @click="closeShareModal" class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Success Message -->
          <div v-if="successMessage" class="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {{ successMessage }}
          </div>
          
          <!-- Error Message -->
          <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {{ errorMessage }}
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
                <div class="flex-1">
                  <p class="text-xs text-gray-500">Expires: {{ formatExpiryDate(link.expiry) }}</p>
                  <p class="text-xs text-blue-500 truncate">{{ link.url }}</p>
                </div>
                <div class="flex space-x-2">
                  <button 
                    @click="updateShareExpiry(index)" 
                    class="text-blue-500 hover:text-blue-700"
                    title="Update Expiry"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button @click="revokeShareLink(index)" class="text-red-500 hover:text-red-700" title="Revoke Share">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
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

      <!-- Loading State -->
      <div v-if="!authChecked || isLoadingPhotos" class="text-center text-blue-500 text-lg mt-16">
        <div class="flex items-center justify-center">
          <svg class="animate-spin h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ !authChecked ? 'Checking authentication...' : 'Loading group photos...' }}
        </div>
        <div class="mt-4 text-sm text-gray-500">
          If this takes too long, you may need to <button @click="forceLogin" class="text-blue-500 underline">log in again</button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredPhotos.length === 0" class="text-center text-blue-500 text-lg mt-16">
        <div class="mb-4">
          <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p class="text-xl font-medium mb-2">No photos in this group yet</p>
        <p class="text-gray-500">Upload some photos to get started!</p>
      </div>

      <!-- Photo Grid -->
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-2">
        <div
          v-for="(photo, index) in filteredPhotos"
          :key="index"
          @click="openViewer(photo)"
          class="photo-card cursor-pointer bg-white rounded-lg shadow hover:shadow-lg transition flex flex-col overflow-hidden"
        >
          <div class="aspect-square w-full relative flex items-center justify-center bg-gray-100 overflow-hidden">
            <img
              v-if="photo.url"
              :src="photo.url"
              :alt="photo.name || photo.PhotoName || photo.photoName || 'Photo'"
              class="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-300"
              @load="photo.loaded = true"
              @error="handleImageError($event, photo)"
              loading="lazy"
            />
            <div v-else class="flex items-center justify-center h-full w-full text-gray-400">
              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            
            <!-- Group indicator -->
            <div class="absolute top-2 left-2 bg-green-500 text-white p-1 rounded-full" title="Group Photo">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>            <!-- Shared indicator -->
            <div v-if="photo.shared" class="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full" title="Shared Photo">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
          </div>
          <div class="p-2 text-center text-sm font-medium text-gray-700 truncate border-t border-gray-100" :title="photo.name || photo.PhotoName || photo.photoName || 'Photo'">
            {{ photo.name || photo.PhotoName || photo.photoName || 'Photo' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue';
import PhotoViewer from '../views/PhotoViewer.vue';
import shareService from '../services/shareService.js';

export default {
  name: 'GroupPhotos',
  components: { Sidebar, PhotoViewer },
  data() {
    return {
      groupId: null,
      groupName: '',
      groupDescription: '',
      photos: [],
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
      sharedLinks: [],
      errorMessage: '',
      successMessage: '',
      isLoadingPhotos: false,
      authChecked: false,
      imageErrors: []
    };
  },
  computed: {
    filteredPhotos() {
      if (!this.searchQuery) return this.photos;
      return this.photos.filter(photo => {
        const photoName = photo.PhotoName || photo.photoName || photo.name || '';
        return photoName.toLowerCase().includes(this.searchQuery.toLowerCase());
      });
    },
  },
  methods: {
    async handleLogout() {
      try {
        const authService = await import('../services/auth.js').then(module => module.default);
        const result = await authService.logout();
        
        if (result.success) {
          localStorage.removeItem('user');
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
    
    async loadPhotos(files) {
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();

          reader.onload = async (e) => {
            const base64Image = e.target.result.split(',')[1];

            try {
              const authService = await import('../services/auth.js').then(module => module.default);
              await authService.ensureValidToken();
              const token = authService.getIdToken();
              
              if (!token) {
                console.error("Token is null. User may not be logged in.");
                return;
              }

              const user = await authService.getCurrentUser();
              if (!user || !user.id) {
                console.error("Missing user ID");
                return;
              }              // Upload to backend using dedicated group photo upload API
              const response = await fetch('https://fk96bt7fv3.execute-api.ap-southeast-5.amazonaws.com/pixDeployment/groups/upload', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  groupId: this.groupId,
                  photoName: file.name,
                  photoBase64: base64Image,
                  metadata: {
                    size: file.size,
                    type: file.type,
                    uploadedFrom: 'groupPhotos'
                  }
                }),
              });

              if (!response.ok) {
                const errorText = await response.text();
                console.error("Upload failed:", errorText);
                throw new Error(`Upload failed with status ${response.status}`);
              }              const result = await response.json();
              console.log("Group photo uploaded successfully:", result);

              // Show success message
              console.log(`✅ Photo "${file.name}" uploaded to group successfully`);

              // Refresh photos after upload
              await this.fetchGroupPhotos();

            } catch (err) {
              console.error("Upload error:", err);
              alert(`Failed to upload ${file.name}: ${err.message}`);
            }
          };

          reader.readAsDataURL(file);
        }
      }
    },      async fetchGroupPhotos() {
      try {
        this.isLoadingPhotos = true;
        const authService = await import('../services/auth.js').then(module => module.default);
        
        await authService.ensureValidToken();
        const token = authService.getIdToken();
        if (!token) {
          console.error("Token is null. User may not be logged in.");
          return;
        }

        console.log(`🔄 Fetching photos for group: ${this.groupId}`);
        
        // Primary method: Use the new GET /groups/fetch API (pix-groupFetchPhotos Lambda)
        try {
          const response = await fetch(`https://fk96bt7fv3.execute-api.ap-southeast-5.amazonaws.com/pixDeployment/groups/fetch?groupId=${this.groupId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const result = await response.json();
            console.log('📊 Group fetch API response:', result);
            
            const groupPhotos = result.photos || result.images || [];
            
            if (groupPhotos.length === 0) {
              console.log('📝 No photos found for this group');
              this.photos = [];
              return;
            }            // Get presigned URLs for group photos
            const photoIds = groupPhotos.map(p => p.photoId || p.s3Key || p.key || p.id).filter(Boolean);            if (photoIds.length > 0) {
              // Create request body for group presigned URLs
              const requestBody = {
                photoIds: photoIds.map(photoId => ({
                  photoId,
                  expirySeconds: 3600 // Optional: specify expiry time
                }))
              };
              
              const presignRes = await fetch('https://fk96bt7fv3.execute-api.ap-southeast-5.amazonaws.com/pixDeployment/groups/batch-presign', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
              });
              
              if (presignRes.ok) {
                const presignResult = await presignRes.json();
                const urlMap = {};
                (presignResult.urls || []).forEach(({ photoId, signedUrl }) => {
                  urlMap[photoId] = signedUrl;
                });

                this.photos = groupPhotos.map(meta => ({
                  ...meta,
                  photoId: meta.photoId || meta.id || meta.s3Key || meta.key,
                  url: urlMap[meta.photoId || meta.id || meta.s3Key || meta.key] || '',
                  name: meta.PhotoName || meta.name || meta.photoName || 'Unnamed',
                  loaded: false,
                  groupId: this.groupId
                }));
                
                console.log(`✅ Loaded ${this.photos.length} group photos from GET /groups/fetch API`);
                return;
              } else {
                console.warn('Failed to get presigned URLs, using photos without URLs');
                this.photos = groupPhotos.map(meta => ({
                  ...meta,
                  photoId: meta.photoId || meta.id || meta.s3Key || meta.key,
                  url: '',
                  name: meta.PhotoName || meta.name || meta.photoName || 'Unnamed',
                  loaded: false,
                  groupId: this.groupId
                }));
                return;
              }
            } else {
              console.log('📝 No valid photo IDs found in group photos');
              this.photos = [];
              return;
            }
          } else {
            console.warn(`GET /groups/fetch API returned status: ${response.status}`);
            throw new Error(`API returned status: ${response.status}`);
          }
        } catch (apiError) {
          console.log('📝 GET /groups/fetch API not available or failed, using fallback method');
          console.error('API Error:', apiError);
        }
        
        // Fallback: use the existing user photo filtering method
        await this.fetchPhotosWithGroupFilter();
        
      } catch (error) {
        console.error("Error fetching group photos:", error);
        this.photos = [];
      } finally {
        this.isLoadingPhotos = false;
      }
    },
    
    async fetchPhotosWithGroupFilter() {
      try {
        // Fallback: fetch all user photos and filter by groupId
        const authService = await import('../services/auth.js').then(module => module.default);
        const token = authService.getIdToken();
        
        const response = await fetch('https://fk96bt7fv3.execute-api.ap-southeast-5.amazonaws.com/pixDeployment/profile/images', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch photos: ${response.status}`);
        }

        const result = await response.json();
        const allPhotos = result.images || [];
        
        // Filter photos by groupId (for now, we'll simulate some group photos)
        // In reality, this would filter based on the actual groupId in metadata
        const groupPhotos = allPhotos.filter(photo => 
          photo.groupId === this.groupId || 
          (photo.metadata && photo.metadata.groupId === this.groupId)
        );
        
        // For demo purposes, if no group photos found, let's show first 3 photos as group photos
        let photosToShow = groupPhotos;
        if (groupPhotos.length === 0 && allPhotos.length > 0) {
          photosToShow = allPhotos.slice(0, 3); // Show first 3 as demo group photos
          console.log('📝 Demo: Showing first 3 photos as group photos');
        }
        
        if (!photosToShow.length) {
          this.photos = [];
          return;
        }        // Get presigned URLs for group photos
        const photoIds = photosToShow.map(p => p.photoId || p.s3Key || p.key || p.id).filter(Boolean);
          // Create request body for group presigned URLs
        const requestBody = {
          photoIds: photoIds.map(photoId => ({
            photoId,
            expirySeconds: 3600 // Optional: specify expiry time
          }))
        };
        
        const presignRes = await fetch('https://fk96bt7fv3.execute-api.ap-southeast-5.amazonaws.com/pixDeployment/groups/batch-presign', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        if (!presignRes.ok) {
          throw new Error(`Failed to get presigned URLs: ${presignRes.status}`);
        }
        
        const presignResult = await presignRes.json();
        const urlMap = {};
        (presignResult.urls || []).forEach(({ photoId, signedUrl }) => {
          urlMap[photoId] = signedUrl;
        });

        this.photos = photosToShow.map(meta => ({
          ...meta,
          photoId: meta.photoId || meta.id || meta.s3Key || meta.key,
          url: urlMap[meta.photoId || meta.id || meta.s3Key || meta.key] || '',
          name: meta.name || meta.photoName || meta.PhotoName || 'Unnamed',
          loaded: false,
          groupId: this.groupId
        }));
        
        console.log(`✅ Loaded ${this.photos.length} group photos`);
        
      } catch (error) {
        console.error("Fallback photo fetch failed:", error);
        this.photos = [];
      }
    },
    
    searchGroupPhotos() {
      // For now, just filter locally
      console.log('🔍 Searching group photos for:', this.searchQuery);
    },
    
    openViewer(photo) {
      this.selectedPhoto = photo;
      this.isViewerOpen = true;
    },
    
    async downloadPhoto(photo) {
      try {
        console.log('📥 Downloading group photo:', photo);
        
        const photoId = photo.photoId || photo.PhotoID || photo.id || photo.S3Key || photo.s3Key;
        if (!photoId) {
          console.error('No photoId found in photo object:', photo);
          alert('Cannot download photo: No photo ID found');
          return;
        }
        
        const displayName = photo.name || photo.photoName || photo.PhotoName || 'photo';
        const authService = await import('../services/auth.js').then(module => module.default);
        
        await authService.ensureValidToken();
        const token = authService.getIdToken();
        if (!token) {
          console.error("Token is null. User may not be logged in.");
          alert('Please log in to download photos');
          return;
        }
        
        let fileName = displayName;
        if (!fileName.includes('.')) {
          const ext = photo.url ? photo.url.split('?')[0].split('.').pop() || 'jpg' : 'jpg';
          fileName += '.' + ext;
        }        // Use the group-specific download API endpoint
        const response = await fetch('https://fk96bt7fv3.execute-api.ap-southeast-5.amazonaws.com/pixDeployment/groups/download', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },          body: JSON.stringify({
            photoId: photoId,
            filename: fileName
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to get download URL: ${response.status}`);
        }
        
        const result = await response.json();
        const downloadUrl = result.signedUrl || result.downloadUrl || result.url;
        
        if (downloadUrl) {
          window.open(downloadUrl, '_blank');
          console.log('✅ Group photo download initiated for:', displayName);
        } else {
          window.open(photo.url, '_blank');
        }
        
      } catch (error) {
        console.error('❌ Download error:', error);
        if (photo.url) {
          window.open(photo.url, '_blank');
        } else {
          alert(`Failed to download photo: No download URL available`);
        }
      }
    },
    
    async overrideGroupPhoto(photoId, editedPhotoData, newFileName) {
      try {
        console.log('🔄 Overriding group photo:', { photoId, newFileName, groupId: this.groupId });
        
        const authService = await import('../services/auth.js').then(module => module.default);
        await authService.ensureValidToken();
        const token = authService.getIdToken();
        
        if (!token) {
          throw new Error("Authentication token not available");
        }

        // Call the PATCH /groups/override API
        const response = await fetch('https://fk96bt7fv3.execute-api.ap-southeast-5.amazonaws.com/pixDeployment/groups/override', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            groupId: this.groupId,
            photoId: photoId,
            newPhotoName: newFileName,
            newPhotoBase64: editedPhotoData,
            metadata: {
              isEdited: true,
              editedAt: new Date().toISOString(),
              originalPhotoId: photoId
            }
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Group photo override failed:", errorText);
          throw new Error(`Override failed with status ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log("✅ Group photo overridden successfully:", result);

        // Refresh the group photos to show the updated photo
        await this.fetchGroupPhotos();
        
        return { success: true, result };
        
      } catch (error) {
        console.error("❌ Group photo override error:", error);
        throw error;
      }
    },
    
    goToEditor(photo) {
      const photoId = photo.photoId || photo.id || photo.S3Key || photo.s3Key || null;
      
      if (!photoId) {
        console.error('No photoId found in photo object:', photo);
        alert('Cannot edit photo: No photo ID found. Please refresh the page and try again.');
        return;
      }
      
      this.$router.push({ 
        name: 'Editor', 
        query: { 
          photoId: photoId,
          name: photo.name,
          groupId: this.groupId // Pass group context to editor
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
      this.errorMessage = '';
      this.successMessage = '';
    },
    
    async generateShareLink() {
      try {
        this.errorMessage = '';
        this.successMessage = '';
        
        const photoId = this.selectedPhoto.photoId || 
                       this.selectedPhoto.PhotoID || 
                       this.selectedPhoto.id || 
                       this.selectedPhoto.PhotoName || 
                       this.selectedPhoto.name;
        
        if (!photoId) {
          this.errorMessage = 'Cannot generate share link: Photo ID not found';
          return;
        }
        
        const permissions = {
          view: this.sharePermissions.view,
          edit: this.sharePermissions.edit,
          download: this.sharePermissions.download
        };
        
        const result = await shareService.createShareLink(photoId, permissions, this.shareExpiryDate, true);
        
        if (result.success) {
          this.shareLink = result.shareLink;
          this.successMessage = 'Share link generated successfully!';
          
          // Store the shared link
          this.sharedLinks.push({
            url: this.shareLink,
            expiry: this.shareExpiryDate,
            permissions: this.sharePermissions,
            shareId: result.shareId
          });
          
          // Mark photo as shared
          const photoIndex = this.photos.findIndex(p => 
            (p.photoId || p.PhotoID || p.id || p.PhotoName || p.name) === photoId
          );
          if (photoIndex !== -1) {
            this.photos[photoIndex].shared = true;
          }
          
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        } else {
          this.errorMessage = result.error || 'Failed to create share link';
          setTimeout(() => {
            this.errorMessage = '';
          }, 5000);
        }
      } catch (error) {
        console.error('Error generating share link:', error);
        this.errorMessage = error.message || 'An unexpected error occurred';
        setTimeout(() => {
          this.errorMessage = '';
        }, 8000);
      }
    },
    
    copyShareLink() {
      this.$refs.shareLinkInput.select();
      document.execCommand('copy');
      alert('Link copied to clipboard!');
    },
    
    async revokeShareLink(index) {
      try {
        const share = this.sharedLinks[index];
        
        if (!share || !share.shareId) {
          console.warn('Invalid share or missing shareId');
          return;
        }
        
        if (!confirm('Are you sure you want to delete this share link? This action cannot be undone.')) {
          return;
        }
        
        const result = await shareService.deleteShareLink(share.shareId);
        
        if (result.success) {
          this.sharedLinks.splice(index, 1);
          alert('Share link deleted successfully');
          
          // If no more shared links, mark photo as not shared
          if (this.sharedLinks.length === 0) {
            const selectedPhotoId = this.selectedPhoto.photoId || 
                                   this.selectedPhoto.PhotoID || 
                                   this.selectedPhoto.id || 
                                   this.selectedPhoto.PhotoName || 
                                   this.selectedPhoto.name;
            const photoIndex = this.photos.findIndex(p => 
              (p.photoId || p.PhotoID || p.id || p.PhotoName || p.name) === selectedPhotoId
            );
            if (photoIndex !== -1) {
              this.photos[photoIndex].shared = false;
            }
          }
        } else {
          this.errorMessage = result.error || 'Failed to delete share link';
          setTimeout(() => {
            this.errorMessage = '';
          }, 5000);
        }
      } catch (error) {
        console.error('Error deleting share link:', error);
        this.errorMessage = 'An error occurred while deleting the share link';
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    },
    
    async updateShareExpiry(index) {
      try {
        const share = this.sharedLinks[index];
        if (!share || !share.shareId) {
          console.warn('Invalid share or missing shareId');
          return;
        }
        
        const newExpiryInput = prompt('Enter new expiry date (YYYY-MM-DD) or leave empty for 1 week from now:');
        
        let newExpiryDate;
        if (newExpiryInput && newExpiryInput.trim()) {
          const inputDate = new Date(newExpiryInput.trim());
          if (isNaN(inputDate.getTime())) {
            this.errorMessage = 'Invalid date format. Please use YYYY-MM-DD format.';
            setTimeout(() => {
              this.errorMessage = '';
            }, 3000);
            return;
          }
          
          if (inputDate <= new Date()) {
            this.errorMessage = 'Expiry date must be in the future.';
            setTimeout(() => {
              this.errorMessage = '';
            }, 3000);
            return;
          }
          
          newExpiryDate = inputDate.toISOString();
        } else {
          const oneWeekFromNow = new Date();
          oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
          newExpiryDate = oneWeekFromNow.toISOString();
        }
        
        const result = await shareService.updateShareExpiry(share.shareId, newExpiryDate);
        
        if (result.success) {
          this.sharedLinks[index].expiry = newExpiryDate;
          this.successMessage = 'Share expiry updated successfully';
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        } else {
          this.errorMessage = result.error || 'Failed to update share expiry';
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      } catch (error) {
        console.error('Error updating share expiry:', error);
        this.errorMessage = 'An error occurred while updating the share expiry';
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    },
    
    async loadSharedLinks(photo) {
      try {
        this.sharedLinks = [];
        
        if (!photo) {
          console.warn('Invalid photo object provided to loadSharedLinks');
          return;
        }
        
        const photoId = photo.photoId || 
                       photo.PhotoID || 
                       photo.id || 
                       photo.PhotoName || 
                       photo.name;
        
        if (!photoId) {
          console.warn('No valid photoId found for loading shared links');
          return;
        }
        
        const shares = await shareService.getPhotoShares(photoId);
        
        if (shares && shares.length > 0) {
          this.sharedLinks = shares.map(share => {
            let permissions = { 
              view: true, 
              edit: false, 
              download: false 
            };
            
            if (share.permission === 'edit') {
              permissions = { view: true, edit: true, download: false };
            } else if (share.permission === 'download') {
              permissions = { view: true, edit: false, download: true };
            }
            
            return {
              url: share.shareUrl || `${window.location.origin}/shared/${share.shareId}`,
              expiry: share.expiresAt || share.expiryDate,
              permissions: permissions,
              shareId: share.shareId
            };
          });
        }
      } catch (error) {
        console.error('Error loading shared links:', error);
      }
    },
      async deletePhoto(photo) {
      console.log("[Delete Group Photo] Incoming photo object:", photo);

      // Extract display name for confirmation
      const displayName = photo.name || photo.PhotoName || photo.photoName || 'this photo';
      const confirmDelete = confirm(`Are you sure you want to delete "${displayName}" from this group?`);
      if (!confirmDelete) return;

      // Extract valid photoId using all possible fallback keys
      const photoId = photo.photoId || photo.id || photo.S3Key || photo.s3Key || null;
      if (!photoId) {
        alert("This photo cannot be deleted because no photoId was found.");
        console.error("Missing photoId in photo object:", photo);
        return;
      }

      try {
        // Get auth token using the auth service
        const authService = await import('../services/auth.js').then(module => module.default);
        await authService.ensureValidToken();
        const token = authService.getIdToken();
        
        if (!token) {
          alert("You must be logged in to delete photos.");
          console.error("No auth token found.");
          return;
        }

        // Request payload for group photo deletion
        const requestBody = { photoId };
        console.log("[Delete Group Photo] Request body to backend:", requestBody);

        // Use the group photo deletion API endpoint
        const response = await fetch('https://fk96bt7fv3.execute-api.ap-southeast-5.amazonaws.com/pixDeployment/groups/delete', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        // Check if request failed
        if (!response.ok) {
          const errData = await response.json();
          console.error("Failed to delete group photo:", errData);
          alert(`Failed to delete photo: ${errData.error || response.status}`);
          return;
        }

        const result = await response.json();
        console.log("✅ Group photo deleted successfully:", result);

        // Remove deleted photo from local UI state
        this.photos = this.photos.filter(p => {
          const currentPhotoId = p.photoId || p.id || p.S3Key || p.s3Key;
          return currentPhotoId !== photoId;
        });
        
        // Close viewer if open
        this.isViewerOpen = false;
        
        console.log(`✅ Photo "${displayName}" removed from group successfully`);
        
      } catch (error) {
        console.error("❌ Error deleting group photo:", error);
        alert("An error occurred while deleting the photo from the group.");
      }
    },
    
    handleImageError(event, photo) {
      console.warn(`Failed to load image for photo: ${photo.name}`);
      event.target.style.display = 'none';
    },
    
    formatExpiryDate(dateString) {
      if (!dateString) return 'Never';
      const date = new Date(dateString);
      return date.toLocaleString();
    },
    
    getDefaultExpiryDate() {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date.toISOString().slice(0, 16);
    },
    
    async handleEditedPhotoReturn() {
      try {
        const editedPhotoData = this.$route.query.editedPhotoData;
        const newFileName = this.$route.query.newFileName;
        const originalPhotoId = this.$route.query.originalPhotoId;
        
        if (!editedPhotoData || !newFileName || !originalPhotoId) {
          console.warn('Missing data for edited photo return');
          return;
        }
        
        console.log('🔄 Processing edited photo for group override...');
        
        // Call the override API
        await this.overrideGroupPhoto(originalPhotoId, editedPhotoData, newFileName);
        
        console.log('✅ Group photo override completed successfully');
        
        // Clean up the query parameters
        this.$router.replace({
          path: this.$route.path,
          query: {
            groupName: this.$route.query.groupName,
            groupDescription: this.$route.query.groupDescription
          }
        });
        
      } catch (error) {
        console.error('❌ Error handling edited photo return:', error);
        alert(`Failed to update group photo: ${error.message}`);
      }
    },
    
    forceLogin() {
      console.log('🔄 Force login - clearing storage and redirecting');
      localStorage.clear();
      sessionStorage.clear();
      this.$router.replace('/login');
    }
  },
  
  async mounted() {
    try {
      console.log('🔄 GroupPhotos mounted, checking authentication...');
      
      // Get group info from route params
      this.groupId = this.$route.params.groupId;
      this.groupName = this.$route.query.groupName || 'Unknown Group';
      this.groupDescription = this.$route.query.groupDescription || '';
      
      console.log('📁 Group Info:', {
        id: this.groupId,
        name: this.groupName,
        description: this.groupDescription
      });
      
      // Check authentication
      const authService = await import('../services/auth.js').then(module => module.default);
      const token = authService.getIdToken();
      
      if (!token) {
        console.warn('❌ Not authenticated, redirecting to login');
        this.$router.replace('/login');
        return;
      }
      
      const user = await authService.getCurrentUser();
      if (!user || !user.id) {
        console.warn('❌ Invalid user data, redirecting to login');
        this.$router.replace('/login');
        return;
      }
      
      console.log('✅ User authenticated successfully');
      this.authChecked = true;
        // Check if returning from photo editor with edited photo
      if (this.$route.query.editedPhoto === 'true' && this.$route.query.editedPhotoData) {
        console.log('🔄 Handling edited photo return from editor...');
        await this.handleEditedPhotoReturn();
      }
      
      // Fetch group photos
      console.log('🔄 Fetching group photos...');
      await this.fetchGroupPhotos();
      
    } catch (error) {
      console.error("❌ Authentication check failed:", error);
      this.$router.replace('/login');
    }
  }
};
</script>

<style scoped>
.photo-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  transform: translateZ(0);
  will-change: transform;
}

.photo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>
