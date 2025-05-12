<template>
  <div class="flex min-h-screen bg-blue-50">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="flex-1 px-6 py-4">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-blue-900">My Photos</h1>
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

      <!-- Photo Viewer Modal -->
      <PhotoViewer
        v-if="selectedPhoto"
        :visible="isViewerOpen"
        :photo="selectedPhoto"
        @close="isViewerOpen = false"
        @download="downloadPhoto"
        @edit="goToEditor"
        @share="sharePhoto"
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
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue';
import PhotoViewer from '../views/PhotoViewer.vue';

export default {
  components: { Sidebar, PhotoViewer },
  data() {
    return {
      photos: [
        { name: 'default.jpg', url: '/assets/default.jpg' , originalUrl: '/assets/default.jpg' },
      ],
      searchQuery: '',
      selectedPhoto: null,
      isViewerOpen: false,
    };
  },
  computed: {
    filteredPhotos() {
      if (!this.searchQuery) return this.photos;
      return this.photos.filter(photo =>
        photo.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  methods: {
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
          reader.onload = e => {
            this.photos.push({ name: file.name, url: e.target.result });
          };
          reader.readAsDataURL(file);
        }
      });
    },
    openViewer(photo) {
      this.selectedPhoto = {
        name: photo.name,
        src: photo.url || photo.src  
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
          photo: photo.originalUrl || photo.url, // Use originalUrl if available
          name: photo.name 
        } 
      });
    },
    sharePhoto(photo) {
      alert(`Share link generated for ${photo.name}`);
    },
    deletePhoto(photo) {
      this.photos = this.photos.filter(p => p !== photo);
      this.isViewerOpen = false;
    },
      goToEditor(photo) {
    this.$router.push({ 
      name: 'Editor', 
      query: { 
        photo: photo.url, 
        name: photo.name 
      } 
    });
  }
},
  created() {
    if (this.$route.query.editedPhoto) {
      // Find the photo by name or create a new entry
      const photoName = this.$route.query.originalName;
      const existingIndex = this.photos.findIndex(p => p.name === photoName);
      
      if (existingIndex !== -1) {
        // Update existing photo
        this.photos[existingIndex].url = this.$route.query.editedPhoto;
        this.photos[existingIndex].originalUrl = this.$route.query.editedPhoto; // Store original
      } else {
        // Add new photo
        this.photos.push({
          name: photoName,
          url: this.$route.query.editedPhoto,
          originalUrl: this.$route.query.editedPhoto
        });
      }
    }
  },
  };
</script>

<style scoped>
.btn {
  @apply bg-white text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-100;
}
</style>
