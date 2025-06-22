<template>
  <div class="flex min-h-screen h-screen bg-blue-50 overflow-hidden">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="flex-1 px-6 py-4 overflow-y-auto">
      
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
        <div class="bg-white rounded-lg p-6 w-full max-w-md">          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Share Photo</h2>
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
      </div>      <!-- Photo Viewer Modal -->
      <PhotoViewer
        v-if="selectedPhoto && isViewerOpen && !isShareModalOpen"
        :visible="isViewerOpen"
        :photo="selectedPhoto"
        @close="isViewerOpen = false"        @download="downloadPhoto"
        @edit="goToEditor"
        @share="openShareModal"
        @delete="deletePhoto"
      /><!-- Photo Grid -->
      <div v-if="!authChecked || isLoadingPhotos" class="text-center text-blue-500 text-lg mt-16">
        <div class="flex items-center justify-center">
          <svg class="animate-spin h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>          {{ !authChecked ? 'Checking authentication...' : 'Loading photos...' }}
        </div>
        <div class="mt-4 text-sm text-gray-500">
          If this takes too long, you may need to <button @click="forceLogin" class="text-blue-500 underline">log in again</button>
        </div>
      </div>
      <div v-else-if="filteredPhotos.length === 0" class="text-center text-blue-500 text-lg mt-16">
        No photos found. Upload or change your search.
      </div>      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-2">
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
            <div v-if="photo.shared" class="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full">
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

    <!-- Create Group Modal -->
    <div 
      v-if="showCreateGroupModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="hideCreateGroup"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 class="text-xl font-bold mb-4 text-gray-800">Create New Group</h2>
        
        <!-- Success Message -->
        <div v-if="groupCreationSuccess" class="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {{ groupCreationSuccess }}
        </div>
        
        <!-- Error Message -->
        <div v-if="groupCreationError" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {{ groupCreationError }}
        </div>

        <!-- Group Name Input -->
        <div class="mb-4">
          <label for="groupName" class="block text-sm font-medium text-gray-700 mb-2">
            Group Name <span class="text-red-500">*</span>
          </label>
          <input
            id="groupName"
            v-model="newGroupName"
            type="text"
            placeholder="Enter group name"
            maxlength="50"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :disabled="isCreatingGroup"
            @keyup.enter="handleGroupNameEnter"
          />
          <p class="text-sm text-gray-500 mt-1">{{ newGroupName.length }}/50 characters</p>
        </div>

        <!-- Group Description Input -->
        <div class="mb-6">
          <label for="groupDescription" class="block text-sm font-medium text-gray-700 mb-2">
            Description (optional)
          </label>
          <textarea
            id="groupDescription"
            v-model="newGroupDescription"
            placeholder="Enter group description"
            maxlength="200"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            :disabled="isCreatingGroup"
          ></textarea>
          <p class="text-sm text-gray-500 mt-1">{{ newGroupDescription.length }}/200 characters</p>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3">
          <button
            @click="hideCreateGroup"
            class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
            :disabled="isCreatingGroup"
          >
            Cancel
          </button>
          <button
            @click="createNewGroup"
            :disabled="isCreatingGroup || !newGroupName.trim()"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
          >
            <svg v-if="isCreatingGroup" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isCreatingGroup ? 'Creating...' : 'Create Group' }}
          </button>
        </div>      </div>    </div>
  
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue';
import PhotoViewer from '../views/PhotoViewer.vue';
import GroupManagement from '../views/GroupManagement.vue';
import shareService from '../services/shareService.js';
import groupService from '../services/groupService.js';

export default {
  components: { Sidebar, PhotoViewer, GroupManagement },  
  data() {
    return {
      photos: [], // Empty array, will fetch from AWS
      searchQuery: '',
      selectedPhoto: null,
      isViewerOpen: false,      
      isShareModalOpen: false,
      shareLink: '',
      shareExpiryDate: '',
      shouldRefreshPhotos: false, // Flag to indicate if photos should be refreshed (when coming from PhotoEditor)
      sharePermissions: {
        view: true,
        edit: false,
        download: false
      },
      sharedLinks: [],
      errorMessage: '',
      successMessage: '',
      isLoading: false,
      // Group creation
      showCreateGroupModal: false,
      newGroupName: '',
      newGroupDescription: '',
      isCreatingGroup: false,
      groupCreationError: '',
      groupCreationSuccess: '',
      // Loading states
      isLoadingPhotos: false,
      authChecked: false,
      
      // Image error tracking
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

              // Parse successful result
              const result = await response.json();
              console.log("Uploaded successfully:", result);

              // After upload, re-fetch the photo list so new photo has photoId and all backend fields
              await this.fetchUserPhotos();

            } catch (err) {
              console.error("Upload error:", err);
            }
          };

          reader.readAsDataURL(file);
        }
      });
    },
    openViewer(photo) {
      this.selectedPhoto = photo;
      this.isViewerOpen = true;
    },
    
    async downloadPhoto(photo) {
      try {
        console.log('Downloading photo:', photo);
        
        // Extract photoId using multiple fallbacks
        const photoId = photo.photoId || 
                       photo.PhotoID || 
                       photo.id || 
                       photo.S3Key || 
                       photo.s3Key;
                       
        if (!photoId) {
          console.error('No photoId found in photo object:', photo);
          alert('Cannot download photo: No photo ID found');
          return;
        }
        
        // Get file name with fallbacks for display in toast/console
        const displayName = photo.name || photo.photoName || photo.PhotoName || 'photo';
        
        // Import auth service
        const authService = await import('../services/auth.js').then(module => module.default);
        
        // Ensure token is valid
        await authService.ensureValidToken();
        const token = authService.getIdToken();
        if (!token) {
          console.error("Token is null. User may not be logged in.");
          alert('Please log in to download photos');
          return;
        }
          // Get file name to use for download
        let fileName = displayName;
        if (!fileName.includes('.')) {
          // Try to extract extension from URL or default to jpg
          const ext = photo.url ? photo.url.split('?')[0].split('.').pop() || 'jpg' : 'jpg';
          fileName += '.' + ext;
        }
        
        // Call the special download API endpoint
        const response = await fetch('https://fk96bt7fv3.execute-api.ap-southeast-5.amazonaws.com/pixDeployment/photos/display', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            photoId: photoId,
            filename: fileName  // Include filename for content-disposition header
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to get download URL: ${response.status}`);
        }
          const result = await response.json();
        console.log('Download URL response:', result);
        
        // Check for different possible response structures
        const downloadUrl = result.downloadUrl || 
                           (result.url ? result.url : null) || 
                           (result.urls && result.urls.length > 0 ? result.urls[0].signedUrl : null) || 
                           (result.signedUrl ? result.signedUrl : null);
        
        if (downloadUrl) {
          console.log('Opening download URL:', downloadUrl);
          
          // Open the download URL which should trigger automatic download
          // due to Content-Disposition header set on the server
          window.open(downloadUrl, '_blank');
          
          console.log('Download initiated for:', displayName);
        } else {
          // Fall back to basic method if we have a URL
          if (photo.url) {
            console.log('No special download URL found, using photo URL directly');
            window.open(photo.url, '_blank');
          } else {
            throw new Error('No download URL returned from the server');
          }
        }      } catch (error) {
        console.error('Download error:', error);
        
        // Don't show an alert - just silently fall back to regular URL method
        // This provides a better user experience
        
        // Fall back to basic method if we have a URL
        if (photo.url) {
          console.log('Falling back to direct URL download due to error:', error.message);
          
          try {
            // Create a more reliable download method as fallback
            fetch(photo.url)
              .then(response => response.blob())
              .then(blob => {
                // Create a blob URL (in your own domain)
                const blobUrl = URL.createObjectURL(blob);
                
                // Get file name with proper extension
                let fileName = displayName;
                if (!fileName.includes('.')) {
                  const ext = photo.url.split('?')[0].split('.').pop() || 'jpg';
                  fileName += '.' + ext;
                }
                
                // Create link with blob URL
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                
                // Clean up
                setTimeout(() => {
                  document.body.removeChild(link);
                  URL.revokeObjectURL(blobUrl);
                }, 100);
                
                console.log('Fallback download complete for:', fileName);
              })
              .catch(fallbackError => {
                console.error('Fallback download failed:', fallbackError);
                // Last resort: direct window.open
                window.open(photo.url, '_blank');
              });
          } catch (fallbackError) {
            console.error('Error in fallback download:', fallbackError);
            window.open(photo.url, '_blank');
          }
        } else {
          // Only show alert if we have no fallback URL
          alert(`Failed to download photo: No download URL available`);
        }
      }
    },    
    goToEditor(photo) {
      // Extract photoId from photo object, trying all possible property names
      const photoId = photo.photoId || photo.id || photo.S3Key || photo.s3Key || null;
      
      if (!photoId) {
        console.error('No photoId found in photo object:', photo);
        alert('Cannot edit photo: No photo ID found. Please refresh the page and try again.');
        return;
      }
      
      this.$router.push({ 
        name: 'Editor', 
        query: { 
          photoId: photoId, // Use photo ID for reliable presigned URL fetching
          name: photo.name,
          // We no longer need to pass the direct photo URL as we're using photoId
        } 
      });
    },
    
    openShareModal(photo) {
      this.selectedPhoto = photo;
      this.isShareModalOpen = true;
      this.shareLink = '';
      this.shareExpiryDate = this.getDefaultExpiryDate();
      
      // Load existing shared links for this photo
      this.loadSharedLinks(photo);
    },
    
    closeShareModal() {
      this.isShareModalOpen = false;
      this.shareLink = '';
    },    
    
    async generateShareLink() {
      try {
        // Show loading state
        this.isLoading = true;
        this.errorMessage = '';
        
        // Extract photoId using multiple fallbacks
        const photoId = this.selectedPhoto.photoId || 
                       this.selectedPhoto.PhotoID || 
                       this.selectedPhoto.id || 
                       this.selectedPhoto.PhotoName || 
                       this.selectedPhoto.name;
        
        console.log('🔍 Selected photo object:', this.selectedPhoto);
        console.log('📋 Generating share link for photo:', photoId);
        
        if (!photoId) {
          console.error('❌ No valid photoId found in photo object');
          this.errorMessage = 'Cannot generate share link: Photo ID not found';
          return;
        }
        
        // Construct the permissions object
        const permissions = {
          view: this.sharePermissions.view,
          edit: this.sharePermissions.edit,
          download: this.sharePermissions.download
        };
        console.log('Selected permissions:', permissions);
          // Call the AWS API via our service (for individual photos, Group: false)
        console.log('Calling createShareLink API...');
        const result = await shareService.createShareLink(photoId, permissions, this.shareExpiryDate, false);
        console.log('API response:', result);
        
        if (result.success) {
          this.shareLink = result.shareLink;
          console.log('Share link generated:', this.shareLink);
          
          // Store the shared link
          this.sharedLinks.push({
            url: this.shareLink,
            expiry: this.shareExpiryDate,
            permissions: this.sharePermissions,
            shareId: result.shareId
          });
            // Mark the photo as shared
          const photoIndex = this.photos.findIndex(p => 
            (p.photoId || p.PhotoID || p.id || p.PhotoName || p.name) === photoId
          );
          if (photoIndex !== -1) {
            this.photos[photoIndex].shared = true;
          }
          
          // Show success message
          this.errorMessage = '';
        } else {
          // Handle error
          console.error('API returned error:', result.error);
          this.errorMessage = result.error || 'Failed to create share link';
          setTimeout(() => {
            this.errorMessage = '';
          }, 5000);
        }
      } catch (error) {
        console.error('Error generating share link:', error);
        this.errorMessage = error.message || 'An unexpected error occurred';
        
        // Keep error visible longer for debugging
        setTimeout(() => {
          this.errorMessage = '';
        }, 8000);
      } finally {
        // Hide loading state
        this.isLoading = false;
      }
    },
    
    copyShareLink() {
      this.$refs.shareLinkInput.select();
      document.execCommand('copy');
      this.$toast.success('Link copied to clipboard!');
    },    
    
    async revokeShareLink(index) {
      try {
        const share = this.sharedLinks[index];
        
        if (!share || !share.shareId) {
          console.warn('Invalid share or missing shareId');
          return;
        }
        
        // Ask for confirmation before deleting
        if (!confirm('Are you sure you want to delete this share link? This action cannot be undone.')) {
          return;
        }
        
        console.log('🗑️ Deleting share link:', share.shareId);
        
        // Call the AWS API to delete the share link
        const result = await shareService.deleteShareLink(share.shareId);
          if (result.success) {
          console.log('✅ Share link deleted successfully');
          
          // Remove from local array
          this.sharedLinks.splice(index, 1);
          
          // Show success message
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
          }} else {
          console.error('❌ Failed to delete share link:', result.error);
          
          // Show error message
          this.errorMessage = result.error || 'Failed to delete share link';
          setTimeout(() => {
            this.errorMessage = '';
          }, 5000);
        }      
      } catch (error) {
        console.error('❌ Error deleting share link:', error);
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
        
        // Show a simple prompt for new expiry date
        const newExpiryInput = prompt('Enter new expiry date (YYYY-MM-DD) or leave empty for 1 week from now:');
        
        let newExpiryDate;
        if (newExpiryInput && newExpiryInput.trim()) {
          // Parse the user input
          const inputDate = new Date(newExpiryInput.trim());
          if (isNaN(inputDate.getTime())) {
            this.errorMessage = 'Invalid date format. Please use YYYY-MM-DD format.';
            setTimeout(() => {
              this.errorMessage = '';
            }, 3000);
            return;
          }
          
          // Check if the date is in the future
          if (inputDate <= new Date()) {
            this.errorMessage = 'Expiry date must be in the future.';
            setTimeout(() => {
              this.errorMessage = '';
            }, 3000);
            return;
          }
          
          newExpiryDate = inputDate.toISOString();
        } else {
          // Default to 1 week from now
          const oneWeekFromNow = new Date();
          oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
          newExpiryDate = oneWeekFromNow.toISOString();
        }
        
        console.log('Updating share expiry:', share.shareId, 'to:', newExpiryDate);
        
        // Call the AWS API to update the share expiry
        const result = await shareService.updateShareExpiry(share.shareId, newExpiryDate);
        
        if (result.success) {
          // Update the local array
          this.sharedLinks[index].expiry = newExpiryDate;
          
          // Show success message
          this.successMessage = 'Share expiry updated successfully';
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        } else {
          // Show error message
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
        
        // Extract photoId using multiple fallbacks
        const photoId = photo.photoId || 
                       photo.PhotoID || 
                       photo.id || 
                       photo.PhotoName || 
                       photo.name;
        
        console.log('🔍 Loading shared links for photo:', photoId);
        
        if (!photoId) {
          console.warn('No valid photoId found for loading shared links');
          return;
        }
        
        // Call the AWS API to get shares for this photo
        const shares = await shareService.getPhotoShares(photoId);
        
        // Map the API response to our UI format
        if (shares && shares.length > 0) {
          this.sharedLinks = shares.map(share => {
            // Convert permission string back to object for UI
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
        // Don't show an error message to the user here since this is a background operation
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
    
    /**
     * Handle image loading errors and replace with placeholder
     */
    handleImageError(event, photo) {
      console.warn(`Failed to load image for photo: ${photo.name}`);
      // Replace with a placeholder image or apply a class to show a fallback
      event.target.style.display = 'none';
      // Add to error log for troubleshooting
      if (!this.imageErrors) this.imageErrors = [];
      this.imageErrors.push({
        photoId: photo.photoId || photo.id,
        name: photo.name,
        url: photo.url,
        time: new Date().toISOString()
      });
    },
    
    async deletePhoto(photo) {
      console.log("[Delete Photo] Incoming photo object:", photo);

      // Extract display name for confirmation
      const displayName = photo.name || photo.PhotoName || 'this photo';

      const confirmDelete = confirm(`Are you sure you want to delete "${displayName}"?`);
      if (!confirmDelete) return;

      // Extract valid photoId using all possible fallback keys
      const photoId = photo.photoId || photo.id || photo.S3Key || photo.s3Key || null;

      if (!photoId) {
        alert("This photo cannot be deleted because no photoId was found.");
        console.error("Missing photoId in photo object:", photo);
        return;
      }      try {
        // Get auth token using the auth service
        const authService = await import('../services/auth.js').then(module => module.default);
        await authService.ensureValidToken();
        const token = authService.getIdToken();
        
        if (!token) {
          alert("You must be logged in to delete photos.");
          console.error("No auth token found.");
          return;
        }

        // Request payload
        const requestBody = { photoId };
        console.log("[Delete Photo] Request body to backend:", requestBody);

        const response = await fetch('https://fk96bt7fv3.execute-api.ap-southeast-5.amazonaws.com/pixDeployment/photos', {
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
          console.error("Failed to delete photo:", errData);
          alert(`Failed to delete photo: ${errData.error || response.status}`);
          return;
        }

        const result = await response.json();
        console.log("Photo deleted successfully:", result);

        // Remove deleted photo from local UI state
        this.photos = this.photos.filter(p => p.photoId !== photo.photoId);
        this.isViewerOpen = false;
      } catch (error) {
        console.error("Error deleting photo:", error);
        alert("An error occurred while deleting the photo.");
      }
    },
    
    /**
     * Show the create group modal
     */
    showCreateGroup() {
      this.showCreateGroupModal = true;
      this.newGroupName = '';
      this.newGroupDescription = '';
      this.groupCreationError = '';
      this.groupCreationSuccess = '';
    },

    /**
     * Hide the create group modal
     */
    hideCreateGroup() {
      this.showCreateGroupModal = false;
      this.newGroupName = '';
      this.newGroupDescription = '';
      this.groupCreationError = '';
      this.groupCreationSuccess = '';
    },

    /**
     * Create a new group
     */
    async createNewGroup() {
      this.groupCreationError = '';
      this.groupCreationSuccess = '';
      
      // Validate input
      if (!this.newGroupName || this.newGroupName.trim().length === 0) {
        this.groupCreationError = 'Group name is required';
        return;
      }

      try {
        this.isCreatingGroup = true;
        console.log('Creating new group:', this.newGroupName);

        // Call the API using groupService
        const result = await groupService.createGroup(this.newGroupName, this.newGroupDescription);

        if (result.success) {
          this.groupCreationSuccess = result.message || 'Group created successfully!';
          console.log('✅ Group created:', result.group);
          
          // Reset form after successful creation
          setTimeout(() => {
            this.hideCreateGroup();
            // You might want to refresh the groups list here
            // this.loadGroups();
          }, 2000);
          
        } else {
          this.groupCreationError = result.error || 'Failed to create group';
          console.error('❌ Group creation failed:', result.error);
        }

      } catch (error) {
        this.groupCreationError = error.message || 'An unexpected error occurred';
        console.error('❌ Group creation error:', error);
      } finally {
        this.isCreatingGroup = false;
      }
    },

    /**
     * Handle Enter key in group name input
     */
    handleGroupNameEnter() {
      if (!this.isCreatingGroup) {
        this.createNewGroup();
      }
    },
    
    async fetchUserPhotos() {
      try {
        this.isLoadingPhotos = true;
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

        // Fetch photo metadata from backend
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
        console.log("[Profile/Images] Response JSON:", result); // Log full backend response
        const photoMetas = result.images || [];
        if (!photoMetas.length) {
          this.photos = [];
          return;
        }

        // POST all photoIds/S3Keys to /photos/display to get presigned URLs
        const photoIds = photoMetas.map(p => p.photoId || p.s3Key || p.key || p.id).filter(Boolean);
        if (!photoIds.length) {
          this.photos = [];
          return;
        }
        
        const presignRes = await fetch('https://fk96bt7fv3.execute-api.ap-southeast-5.amazonaws.com/pixDeployment/photos/display', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ photoIds }),
        });
        if (!presignRes.ok) {
          throw new Error(`Failed to get presigned URLs: ${presignRes.status}`);
        }
        const presignResult = await presignRes.json();
        console.log("[Photos/Display] Response JSON:", presignResult); // Log full backend response
        // presignResult should be { urls: { [photoId]: presignedUrl, ... } }
        const urlMap = {};
        (presignResult.urls || []).forEach(({ photoId, signedUrl }) => {
          urlMap[photoId] = signedUrl;
        });        // Map presigned URLs to photos, always set photoId
        this.photos = photoMetas.map(meta => {
          // Generate unique id for each photo
          const photoId = meta.photoId || meta.id || meta.s3Key || meta.key;
          // Get URL from mapping or use empty string
          const url = urlMap[photoId] || '';
          // Ensure name is present
          const name = meta.name || meta.photoName || meta.PhotoName || meta.s3Key || meta.key || meta.id || 'Unnamed';
          
          return {
            ...meta,
            photoId,
            url,
            name,
            // Flag to track if image is loaded
            loaded: false
          };
        });
        
        console.log("Photos with presigned URLs:", this.photos);
      } catch (error) {
        console.error("Error fetching photos:", error);      
      } finally {
        this.isLoadingPhotos = false;
      }
    },
    
    async searchPhotos() {
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
        }
        // Call AWS backend search endpoint
        const response = await fetch('https://fk96bt7fv3.execute-api.ap-southeast-5.amazonaws.com/pixDeployment/photos', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            query: this.searchQuery
          }),
        });
        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }
        const result = await response.json();
        const photoMetas = result.images || [];
        if (!photoMetas.length) {
          this.photos = [];
          return;
        }
        // Get presigned URLs for search results
        const photoIds = photoMetas.map(p => p.photoId || p.s3Key || p.key || p.id).filter(Boolean);
        if (!photoIds.length) {
          this.photos = [];
          return;
        }
        const presignRes = await fetch('https://fk96bt7fv3.execute-api.ap-southeast-5.amazonaws.com/pixDeployment/photos/display', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ photoIds }),
        });
        if (!presignRes.ok) {
          throw new Error(`Failed to get presigned URLs: ${presignRes.status}`);
        }
        const presignResult = await presignRes.json();
        const urlMap = {};
        (presignResult.urls || []).forEach(({ photoId, signedUrl }) => {
          urlMap[photoId] = signedUrl;
        });
        this.photos = photoMetas.map(meta => ({
          ...meta,
          photoId: meta.photoId || meta.id || meta.s3Key || meta.key,
          url: urlMap[meta.photoId || meta.id || meta.s3Key || meta.key] || '',
        }));      } catch (error) {
        console.error("Error searching photos:", error);
      } finally {
        this.isLoadingPhotos = false;
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
    // Check authentication
    try {
      console.log('🔄 Dashboard mounted, checking authentication...');
      const authService = await import('../services/auth.js').then(module => module.default);
      
      // Check if user is actually authenticated
      const token = authService.getIdToken();
      console.log('🔍 Token check:', token ? 'Token found' : 'No token found');
      
      if (!token) {
        console.warn('❌ Not authenticated, redirecting to login');
        // Clear any stale data and redirect
        localStorage.clear();
        this.$router.replace('/login');
        return;
      }
      
      // Try to get current user to verify token is valid
      try {
        const user = await authService.getCurrentUser();
        console.log('✅ Current user:', user);
        
        if (!user || !user.id) {
          console.warn('❌ Invalid user data, redirecting to login');
          localStorage.clear();
          this.$router.replace('/login');
          return;
        }
        
        console.log('✅ User authenticated successfully');
        this.authChecked = true;
        
        // If authenticated, fetch photos
        console.log('🔄 Fetching photos...');
        await this.fetchUserPhotos();
        
        // If we're coming from the photo editor with a refresh flag, just ensure we've refreshed photos
        if (this.shouldRefreshPhotos) {
          console.log('📸 Photos refreshed after edit');
          
          // We still sort to find the newest photo for debug purposes
          if (this.photos.length > 0) {
            const sortedPhotos = [...this.photos].sort((a, b) => {
              const timeA = a.createdAt || a.lastModified || a.timestamp || 0;
              const timeB = b.createdAt || b.lastModified || b.timestamp || 0;
              return new Date(timeB) - new Date(timeA);
            });
            
            // Log the newest photo but don't automatically open it
            const newestPhoto = sortedPhotos[0];
            if (newestPhoto) {
              console.log('🔍 Most recent photo:', newestPhoto.name);
            }
          }
          
          // Reset the flag
          this.shouldRefreshPhotos = false;
        }
        
      } catch (userError) {
        console.error('❌ Token validation failed:', userError);
        localStorage.clear();
        this.$router.replace('/login');
        return;
      }
      
    } catch (error) {
      console.error("❌ Authentication check failed:", error);
      localStorage.clear();
      this.$router.replace('/login');
    }
  },
  
  created() {
    // Check if we're coming back from photo editor and need to refresh photos
    if (this.$route.query.refreshPhotos === 'true') {
      console.log('Photo editor requested photo refresh - will fetch latest photos');
      this.shouldRefreshPhotos = true;
    }
    
    // Legacy support for direct edited photo URL passing (can be removed in future)
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
    
    // Note: fetchUserPhotos() is now called in mounted() after auth check
  }
};
</script>

<style scoped>
.btn {
  background-color: white;
  color: #4a5568;
  padding: 1rem 0.5rem;
  border-radius: 0.25rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}
.btn:hover {
  background-color: #f7fafc;
}

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
