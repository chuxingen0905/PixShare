<template>
  <div class="min-h-screen bg-gray-100 p-6 flex">
    <!-- Tools Sidebar -->
    <div class="w-64 bg-white p-4 rounded-lg shadow mr-6">
      <header class="flex justify-between items-center mb-4">
        <h1 class="text-xl font-bold">Photo Editor</h1>
        <button @click="goBack" class="text-blue-600 hover:underline">← Back</button>
      </header>

      <!-- Tools Section -->
      <div class="space-y-6">
        <!-- Transform Tools -->
        <div>
          <h2 class="text-lg font-semibold mb-2 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
            </svg>
            Transform
          </h2>
          <div class="grid grid-cols-2 gap-2">
            <button @click="activateTool('crop')" class="tool-btn" :class="{'bg-blue-300': currentTool === 'crop'}">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
              </svg>
              Crop
            </button>
            <button @click="activateTool('rotate')" class="tool-btn" :class="{'bg-blue-300': currentTool === 'rotate'}">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Rotate
            </button>
            <button @click="activateTool('resize')" class="tool-btn" :class="{'bg-blue-300': currentTool === 'resize'}">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
              </svg>
              Resize
            </button>
          </div>
        </div>

        <!-- Adjustments Section -->
        <div>
          <h2 class="text-lg font-semibold mb-2 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
            </svg>
            Adjustments
          </h2>
          <div class="grid grid-cols-2 gap-2">
            <button @click="activateTool('brightness')" class="tool-btn" :class="{'bg-blue-300': currentTool === 'brightness'}">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              Brightness
            </button>
            <button @click="activateTool('contrast')" class="tool-btn" :class="{'bg-blue-300': currentTool === 'contrast'}">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
              </svg>
              Contrast
            </button>
            <button @click="activateTool('blur')" class="tool-btn" :class="{'bg-blue-300': currentTool === 'blur'}">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              Blur
            </button>
            <button @click="activateTool('saturation')" class="tool-btn" :class="{'bg-blue-300': currentTool === 'saturation'}">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
              </svg>
              Saturation
            </button>
            <button @click="activateTool('text')" class="tool-btn" :class="{'bg-blue-300': currentTool === 'text'}">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Add Text
            </button>
            <button @click="activateTool('background')" class="tool-btn" :class="{'bg-blue-300': currentTool === 'background'}">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              BG
            </button>
          </div>
        </div>
        <!-- Exprot Section -->      <div>
        <h2 class="text-lg font-semibold mb-2 flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
          </svg>
          Save Options
        </h2>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Choose Format</label>
          <div class="grid grid-cols-3 gap-2">
            <button 
              @click="setOutputFormat('jpeg')" 
              class="p-2 border rounded text-center text-sm" 
              :class="outputFormat === 'jpeg' ? 'bg-blue-100 border-blue-400' : 'bg-white'"
            >
              JPEG
            </button>
            <button 
              @click="setOutputFormat('png')" 
              class="p-2 border rounded text-center text-sm" 
              :class="outputFormat === 'png' ? 'bg-blue-100 border-blue-400' : 'bg-white'"
            >
              PNG
            </button>
            <button 
              @click="setOutputFormat('webp')" 
              class="p-2 border rounded text-center text-sm" 
              :class="outputFormat === 'webp' ? 'bg-blue-100 border-blue-400' : 'bg-white'"
            >
              WebP
            </button>
          </div>
        </div>        <div class="mb-1">
          <button @click="saveWithOptions('return')" class="w-full py-3 bg-green-100 hover:bg-green-200 rounded-md flex items-center justify-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
            </svg>
            Save & Return
          </button>
        </div>
      </div>
      </div>
    </div>

    <!-- Main Editing Area -->
    <div class="flex-1 bg-white p-4 rounded-lg shadow flex flex-col">      <!-- Image Display -->
      <div class="flex-1 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden relative">
        <!-- Loading indicator -->
        <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p class="mt-2 text-gray-700">Loading image...</p>
          </div>
        </div>
        
        <!-- Error message -->
        <div v-if="loadError" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
          <div class="text-center p-6 max-w-md">
            <div class="text-red-500 mb-2">
              <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">Failed to load image</h3>
            <p class="mt-2 text-gray-600">{{ errorMessage || 'Unable to load image. This may be due to permissions or CORS restrictions.' }}</p>
            <div class="mt-4">
              <router-link to="/dashboard" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Return to dashboard
              </router-link>
            </div>
          </div>
        </div>
          <div v-if="!isCropping" class="relative w-full h-full flex items-center justify-center">
          <!-- Fixed size container for consistent display -->          <div class="image-container">
            <img
              ref="image"
              :src="photo"
              class="editor-image"
              :style="[imageStyle, { width: displayWidth + 'px', height: 'auto', maxHeight: '70vh' }]"
              crossorigin="anonymous"
            />
          </div>
          <div 
            v-for="(text, index) in textElements" 
            :key="index"
            class="absolute"
            :style="{
              top: text.y + 'px',
              left: text.x + 'px',
              color: text.color,
              fontSize: text.size + 'px',
              fontFamily: text.font,
              fontWeight: text.bold ? 'bold' : 'normal',
              fontStyle: text.italic ? 'italic' : 'normal',
              textDecoration: text.underline ? 'underline' : 'none',
              cursor: 'move',
              zIndex: 10
            }"
            @mousedown="startTextDrag($event, index)"
            @dblclick="editText(index)"
          >
            {{ text.content }}
          </div>
        </div>        <!-- Cropping Interface -->
        <div v-if="isCropping" class="w-full h-full flex items-center justify-center">
          <div class="image-container">            <img
              ref="cropImage"
              :src="photo"
              class="editor-image"
              :style="{ width: displayWidth + 'px', height: 'auto', maxHeight: '70vh' }"
              crossorigin="anonymous"
            />
          </div>
        </div>
      </div>

      <!-- Active Tool Controls -->
      <div class="mt-4">
        <!-- Cropping Controls -->
        <div v-if="isCropping" class="bg-gray-50 p-4 rounded-lg">
          <div class="flex justify-end gap-2">
            <button @click="cancelCrop" class="btn-secondary">
              Cancel
            </button>
            <button @click="saveCrop" class="btn-primary">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Save Crop
            </button>
          </div>
        </div>

        <!-- Rotate Controls -->
        <div v-if="currentTool === 'rotate'" class="bg-gray-50 p-4 rounded-lg">
          <div class="grid grid-cols-4 gap-2 mb-4">
            <button @click="rotateImage(-90)" class="btn-rotate">
              <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
              </svg>
              90° Left
            </button>
            <button @click="rotateImage(90)" class="btn-rotate">
              <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
              </svg>
              90° Right
            </button>
            <button @click="rotateImage(180)" class="btn-rotate">
              <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              180°
            </button>
            <button @click="rotateImage(0)" class="btn-rotate">
              <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Reset
            </button>
          </div>
          <div class="flex justify-end gap-2">
            <button @click="cancelRotation" class="btn-secondary">
              Cancel
            </button>
            <button @click="saveRotation" class="btn-primary" :disabled="!rotationChanged">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Save Rotation
            </button>
          </div>
        </div>

        <!-- Resize Controls -->
        <div v-if="currentTool === 'resize'" class="bg-gray-50 p-4 rounded-lg">
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Width (px)</label>
              <input
                type="number"
                v-model.number="resizeWidth"
                class="w-full p-2 border rounded"
                min="1"
                @input="maintainRatio ? updateHeight() : null"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
              <input
                type="number"
                v-model.number="resizeHeight"
                class="w-full p-2 border rounded"
                min="1"
                @input="maintainRatio ? updateWidth() : null"
              >
            </div>
          </div>
          <div class="flex items-center mb-4">
            <input
              type="checkbox"
              id="maintainRatio"
              v-model="maintainRatio"
              class="mr-2"
            >
            <label for="maintainRatio" class="text-sm text-gray-700">Maintain aspect ratio</label>
          </div>
          <div class="flex justify-end gap-2">
            <button @click="cancelResize" class="btn-secondary">
              Cancel
            </button>
            <button @click="saveResize" class="btn-primary">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Save Resize
            </button>
          </div>
        </div>

        <!-- Adjustment Controls (Brightness, Contrast, etc.) -->
        <div v-if="['brightness', 'contrast', 'blur', 'saturation'].includes(currentTool)" class="bg-gray-50 p-4 rounded-lg">
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ currentTool.charAt(0).toUpperCase() + currentTool.slice(1) }}: 
                {{ currentTool === 'blur' ? blur + 'px' : 
                    currentTool === 'saturation' ? saturation + '%' : 
                    currentTool === 'brightness' ? brightness + '%' : 
                    contrast + '%' }}
                </label>
                <input
                type="range"
                :min="currentTool === 'blur' ? 0 : 0"
                :max="currentTool === 'blur' ? 20 : 200"
                :step="currentTool === 'blur' ? 0.1 : 1"
                v-model="adjustmentValues[currentTool]"
                class="w-full"
                >
            </div>
            <div class="flex justify-end gap-2">
                <button @click="cancelAdjustment" class="btn-secondary">
                Cancel
                </button>
                <button @click="saveAdjustment" class="btn-primary">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Save {{ currentTool.charAt(0).toUpperCase() + currentTool.slice(1) }}
                </button>
            </div>
            </div>

            <!-- Text Controls -->
        <div v-if="currentTool === 'text'" class="bg-white p-4 rounded-lg shadow">
        <div class="flex justify-between items-center mb-4">
            <h3 class="font-medium text-gray-700">
            {{ activeTextIndex !== null ? 'Edit Text' : 'Add Text' }}
            </h3>
            <button 
            v-if="activeTextIndex !== null"
            @click="deleteText"
            class="flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Delete
            </button>
        </div>

        <div class="space-y-4">
            <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Text Content</label>
            <input
                type="text"
                v-model="currentText.content"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your text"
                @input="handleTextInput"
            >
            </div>

            <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                <div class="flex items-center">
                <input
                    type="color"
                    v-model="currentText.color"
                    class="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                    @input="handleTextInput"
                >
                <span class="ml-2 text-sm">{{ currentText.color }}</span>
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Size: {{ currentText.size }}px</label>
                <input
                type="range"
                v-model.number="currentText.size"
                min="10"
                max="72"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                @input="handleTextInput"
                >
            </div>
            </div>
        </div>

        <div class="flex justify-end gap-2 mt-4">
            <button 
            @click="cancelText"
            class="px-3 py-1.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            >
            Cancel
            </button>
            <button 
            @click="addText"
            class="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
            Done
            </button>
        </div>
    </div>

      <!-- Background Removal Controls -->
      <div v-if="currentTool === 'background'" class="bg-gray-50 p-4 rounded-lg">
        <div class="mb-4">
          <h3 class="font-medium text-gray-700 mb-2">Background Removal</h3>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Sensitivity: {{ bgRemovalThreshold }}
            </label>
            <input 
              type="range" 
              v-model.number="bgRemovalThreshold" 
              min="0" 
              max="255" 
              class="w-full"
            >
          </div>
          
          <button 
            @click="removeBackground" 
            class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            :disabled="bgProcessing"
          >
            <span v-if="!bgProcessing">Remove Background</span>
            <span v-else>Processing...</span>
          </button>
          
          <div class="flex justify-end gap-2 mt-4">
            <button 
              v-if="bgRemovalActive"
              @click="undoBgRemoval" 
              class="px-3 py-1.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            >
              Undo Removal
            </button>
            <button 
              @click="cancelBackground" 
              class="px-3 py-1.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button 
              v-if="bgRemovalActive"
              @click="saveBackgroundChange" 
              class="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Save
            </button>          </div>
        </div>
      </div>
    </div>
  </div>
</div>

  <!-- Rename Photo Modal -->
  <div 
    v-if="isRenameModalOpen" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
      <h2 class="text-xl font-bold mb-4 text-gray-800">Save Edited Photo</h2>
      
      <!-- Error Message -->
      <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ errorMessage }}
      </div>

      <!-- Photo Name Input -->
      <div class="mb-4">
        <label for="photoName" class="block text-sm font-medium text-gray-700 mb-2">
          Photo Name <span class="text-red-500">*</span>
        </label>
        <input
          id="photoName"
          v-model="newPhotoName"
          type="text"
          placeholder="Enter photo name"
          maxlength="100"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          :disabled="isLoading"
          @keyup.enter="confirmSaveWithName"
        />
        <p class="text-sm text-gray-500 mt-1">{{ newPhotoName.length }}/100 characters</p>
      </div>
      
      <!-- File Format Selection -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Format</label>
        <div class="flex space-x-4">
          <label class="inline-flex items-center">
            <input type="radio" v-model="outputFormat" value="jpeg" class="form-radio text-blue-500">
            <span class="ml-2">JPEG</span>
          </label>
          <label class="inline-flex items-center">
            <input type="radio" v-model="outputFormat" value="png" class="form-radio text-blue-500">
            <span class="ml-2">PNG</span>
          </label>
          <label class="inline-flex items-center">
            <input type="radio" v-model="outputFormat" value="webp" class="form-radio text-blue-500">
            <span class="ml-2">WebP</span>
          </label>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-3">
        <button
          @click="cancelSave"
          class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
          :disabled="isLoading"
        >
          Cancel
        </button>
        <button
          @click="confirmSaveWithName"
          :disabled="isLoading || !newPhotoName.trim()"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
        >
          <svg v-if="isLoading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isLoading ? 'Saving...' : 'Save Photo' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// Import auth service for API authentication
import authService from '../services/auth.js';

export default {  data() {  return {
      // Image source and history management
      photo: '',
      imageHistory: [],
      historyIndex: -1,
      originalPhotoBeforeBgRemoval: null,
      // New photo ID property
      photoId: null,
      // Loading and error states
      isLoading: false,
      loadError: false,
      errorMessage: null,
      urlRefreshAttempted: false,
      
      // Rename dialog
      isRenameModalOpen: false,
      newPhotoName: '',
      originalPhotoName: '',
      editedPhotoDataUrl: null,
      
      // Tool states
      currentTool: null,
      isCropping: false,
      isSelecting: false,
      isAddingText: false,
      isDraggingText: false,
      
      // Cropping related
      cropper: null,
      
      // Background removal related
      bgRemovalMode: null,
      bgProcessing: false,
      bgApiUrl: 'https://api.remove.bg/v1.0/removebg',
      bgRemovalThreshold: 128,
      bgRemovalActive: false,
      bgRemovalStrength: 50,
      bgReplacementColor: '#ffffff',
      bgReplacementType: 'color',
      
      // Selection related
      selectionPoints: [],
      
      // Rotation related
      rotationChanged: false,
      currentRotation: 0,
      
      // Resize related
      resizeWidth: null,
      resizeHeight: null,
      maintainRatio: true,
      originalWidth: null,
      originalHeight: null,
      aspectRatio: null,
      
      // Image adjustments
      adjustmentValues: {
        brightness: 100,
        contrast: 100,
        blur: 0,
        saturation: 100
      },
      originalAdjustments: {
        brightness: 100,
        contrast: 100,
        blur: 0,
        saturation: 100
      },
      
      // Text related
      textElements: [],
      currentText: {
        content: '',
        color: '#000000',
        size: 24,
        font: 'Arial',
        bold: false,
        italic: false,
        underline: false,
        x: 100,
        y: 100
      },
      activeTextIndex: null,
      dragStartX: 0,
      dragStartY: 0,
      textStartX: 0,
      textStartY: 0,      // Output/save options
      outputFormat: 'jpeg' // Default format
    };
  },
  computed: {
    imageStyle() {
      return {
        filter: `
          brightness(${this.adjustmentValues.brightness}%) 
          contrast(${this.adjustmentValues.contrast}%) 
          blur(${this.adjustmentValues.blur}px)
          saturate(${this.adjustmentValues.saturation}%)
        `,
        transform: `rotate(${this.currentRotation}deg)`
      };
    },
    displayWidth() {
      // If no image is loaded yet, return a default size
      if (!this.originalWidth) return 600;
      
      // Calculate a responsive display width that fits well in the editor
      // Maximum display width (pixels)
      const maxDisplayWidth = 900;
      // For very large images, scale them down to fit the editor
      return Math.min(this.originalWidth, maxDisplayWidth);
    },
    brightness: {
      get() { return this.adjustmentValues.brightness; },
      set(val) { this.adjustmentValues.brightness = val; }
    },
    contrast: {
      get() { return this.adjustmentValues.contrast; },
      set(val) { this.adjustmentValues.contrast = val; }
    },
    blur: {
      get() { return this.adjustmentValues.blur; },
      set(val) { this.adjustmentValues.blur = val; }
    },
    saturation: {
      get() { return this.adjustmentValues.saturation; },
      set(val) { this.adjustmentValues.saturation = val; }
    }
  },  methods: {
    goBack() {
      const groupId = this.$route.query.groupId;
      if (groupId) {
        // If editing a group photo, go back to group photos
        this.$router.push({
          path: `/groups/${groupId}/photos`,
          query: {
            groupName: this.$route.query.groupName,
            groupDescription: this.$route.query.groupDescription
          }
        });
      } else {
        // Otherwise, go back to dashboard
        this.$router.push('/dashboard');
      }
    },
    
    showErrorMessage(message) {
      this.errorMessage = message;
      // Using errorMessage instead of alert for better UX
      this.loadError = true;
      console.error(message);
    },
    
    /**
     * Get a presigned URL for a photo from the API
     * @param {string} photoId - The ID of the photo to get a presigned URL for
     * @returns {Promise<string|null>} - The presigned URL or null if an error occurred
     */
    async getPresignedUrl(photoId) {
      try {
        if (!photoId) {
          console.warn('No photo ID provided');
          return null;
        }
          console.log('Fetching presigned URL for photo ID:', photoId);
        
        // Ensure token is valid before making the request
        await authService.ensureValidToken();
        const token = authService.getIdToken();
        
        if (!token) {
          console.error('No authentication token available');
          throw new Error('You must be logged in to view photos');
        }
        
        // Check if this is a group photo edit
        const groupId = this.$route.query.groupId;
        const isGroupPhoto = groupId != null;
        
        // Create request body for presigned URL (different formats for group vs individual)
        const requestBody = isGroupPhoto 
          ? {
              photoIds: [{
                photoId,
                expirySeconds: 3600
              }]
            }
          : {
              photoIds: [photoId]  // Array of photo ID strings for individual photos
            };
        
        // Use different endpoints for group vs individual photos
        const endpoint = isGroupPhoto 
          ? 'https://fk96bt7fv3.execute-api.ap-southeast-5.amazonaws.com/pixDeployment/groups/batch-presign'
          : 'https://fk96bt7fv3.execute-api.ap-southeast-5.amazonaws.com/pixDeployment/photos/display';
          console.log('Is group photo:', isGroupPhoto);
        console.log('Using endpoint:', endpoint);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));
        
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('API error fetching presigned URL:', res.status, errorText);
          throw new Error(`Failed to fetch presigned URL: ${res.status} ${res.statusText}`);
        }        const result = await res.json();
        console.log('Presigned URL API response:', result);
        
        // Handle response format: { urls: [{ photoId, signedUrl }] }
        const url = result.urls?.[0]?.signedUrl;
        
        if (!url) {
          console.error('No presigned URL returned from API');
          console.error('Full response:', result);
          console.error('Expected: { urls: [{ photoId, signedUrl }] }');
          throw new Error('No presigned URL returned from API');
        }
        
        console.log('Successfully fetched presigned URL');
        return url;
      } catch (error) {
        console.error('Error getting presigned URL:', error);
        this.showErrorMessage(error.message || 'Failed to get access to the photo');
        return null;
      }
    },
    
    /**
     * Properly decode and validate a presigned S3 URL
     * This handles issues with URL encoding in presigned AWS URLs
     * @param {string} url The URL to sanitize
     * @return {string} The sanitized URL
     */
    sanitizePresignedUrl(url) {
      if (!url || typeof url !== 'string') {
        return url;
      }
      
      try {
        // First, check if this is an S3 URL with encoded parameters
        if (url.includes('amazonaws.com') && 
           (url.includes('%3F') || url.includes('%26') || url.includes('%3D'))) {
          console.log('Found encoded S3 URL parameters, decoding...');
          return decodeURIComponent(url);
        }
        
        // If it contains amazon but regular encoded chars like %2F, still decode
        if (url.includes('amazonaws.com') && url.includes('%')) {
          return decodeURIComponent(url);
        }
        
        // Otherwise return as is - it's either not an S3 URL or already decoded
        return url;
      } catch (error) {
        console.warn('Error sanitizing URL, returning original:', error);
        return url;
      }
    },
    
    async checkAndRefreshPresignedUrl(url) {
      if (!url) return null;
      
      try {
        const urlObj = new URL(url);
        const linkId = urlObj.searchParams.get('linkId');
        
        if (!linkId) {
          // If we don't have a linkId but we do have a photoId, use our direct method
          if (this.photoId) {
            console.log('No linkId found in URL, using photoId to refresh:', this.photoId);
            return await this.getPresignedUrl(this.photoId);
          }
          
          console.warn('No linkId found in URL and no photoId available, cannot refresh');
          return url; // Return original URL
        }
        
        console.log('Attempting to refresh presigned URL with linkId:', linkId);
        
        // Import service dynamically to avoid circular dependencies
        const presignedService = await import('../services/presignedUrlService');
        const response = await presignedService.getPresignedUrl(linkId);
        
        if (response.success && response.presignedUrl) {
          console.log('Successfully refreshed presigned URL');
          return response.presignedUrl;
        } else {
          console.error('Failed to refresh presigned URL:', response.error);
          return url; // Return original URL as fallback
        }
      } catch (error) {
        console.error('Error refreshing presigned URL:', error);
        return url; // Return original URL as fallback
      }    },      async loadImageWithCorsHandling() {
      // First check if we have a photoId in the route
      this.photoId = this.$route.query.photoId || null;
      let sourceUrl = null;
      
      // Always prioritize photoId if available
      if (this.photoId) {
        console.log('Photo ID found in route, fetching presigned URL:', this.photoId);
        sourceUrl = await this.getPresignedUrl(this.photoId);
        
        if (!sourceUrl) {
          this.showErrorMessage('Failed to get access to the photo. Please try again.');
          return;
        }
      } 
      // Fallback to direct URL only if no photoId is available (legacy support)
      else if (this.$route.query.photo) {
        console.warn('No photoId provided, falling back to direct URL (not recommended)');
        sourceUrl = this.$route.query.photo;
      }
      // No photo information available
      else {
        console.error('No photo ID or URL provided in route query');
        this.showErrorMessage('No photo information provided. Please select a photo from the dashboard.');
        return;
      }
      
      // Properly sanitize and decode the URL to handle encoded characters in presigned URLs
      sourceUrl = this.sanitizePresignedUrl(sourceUrl);
      console.log('Sanitized source URL');
      
      // Check for common URL formatting issues
      if (sourceUrl && sourceUrl.includes('amazonaws.com') && !sourceUrl.includes('?')) {
        console.warn('Potentially malformed S3 URL - missing query parameters');
      }
      
      console.log('Loading image from:', sourceUrl);
      
      // Set loading state
      this.isLoading = true;
      this.loadError = false;
      
      // Check if the URL is a presigned URL and verify it's still valid
      try {
        // If we get a 403/401 error, it might be because the presigned URL expired
        if (sourceUrl.includes('amazonaws.com') && 
           (sourceUrl.includes('X-Amz-') || sourceUrl.includes('Signature=') || sourceUrl.includes('AWSAccessKeyId='))) {
          console.log('Detected presigned URL, checking if it needs refreshing...');
          const refreshedUrl = await this.checkAndRefreshPresignedUrl(sourceUrl);
          if (refreshedUrl && refreshedUrl !== sourceUrl) {
            console.log('URL was refreshed, using new presigned URL');
            sourceUrl = refreshedUrl;
          }
        }
      } catch (error) {
        console.error('Error during URL refresh check:', error);
      }
      
      // First try direct loading with Image object
      const directImg = new Image();
      directImg.crossOrigin = 'anonymous'; // This is important for S3 URLs
      
      // Set timeout to catch hanging loads
      const imageLoadTimeout = setTimeout(() => {
        console.warn('Image load timeout - possible CORS or network issue');
        // Don't call onerror if we're already loading with another method
        if (this.isLoading && directImg.src) {
          directImg.src = ''; // Cancel the current load
          directImg.onerror(new Error('Load timeout'));
        }
      }, 10000); // 10 second timeout
      
      // Set up direct loading handlers
      directImg.onload = () => {
        console.log('Image loaded directly successfully');
        clearTimeout(imageLoadTimeout);
        
        // Use blob URL approach for all images to ensure consistent behavior
        // This creates a local copy of the image for editing
        try {
          const canvas = document.createElement('canvas');
          canvas.width = directImg.width;
          canvas.height = directImg.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(directImg, 0, 0);
          
          // Use a blob for better memory management with large images
          canvas.toBlob((blob) => {
            const localUrl = URL.createObjectURL(blob);
            this.photo = localUrl;
            this.originalWidth = directImg.width;
            this.originalHeight = directImg.height;
            this.aspectRatio = directImg.width / directImg.height;
            this.isLoading = false;
            
            // Save to history as the initial state
            if (this.imageHistory.length === 0) {
              this.saveToHistory();
            }
          }, 'image/png');
        } catch (err) {
          console.error('Error creating local image copy:', err);
          // Fallback to direct URL if canvas approach fails
          this.photo = sourceUrl;
          this.originalWidth = directImg.width;
          this.originalHeight = directImg.height;
          this.aspectRatio = directImg.width / directImg.height;
          this.isLoading = false;
          
          // Save to history as the initial state
          if (this.imageHistory.length === 0) {
            this.saveToHistory();
          }
        }
      };
      
      directImg.onerror = async (e) => {
        console.log('Direct image loading failed, trying fetch API...', e);
        
        // Try fetch as a fallback (might work in some cases where CORS is configured)
        try {
          // Use proper fetch configuration to handle CORS properly
          const response = await fetch(sourceUrl, {
            method: 'GET',
            mode: 'cors', // Try with explicit CORS mode
            credentials: 'omit' // Don't send cookies to S3
          });
          console.log('Fetch response status:', response.status);
          
          if (!response.ok) {
            // Handle specific error cases
            if (response.status === 403) {
              console.error('Access denied (403 Forbidden) - Presigned URL may have expired');
              
              // Try to refresh the URL one more time using our methods
              if (!this.urlRefreshAttempted) {
                console.log('Attempting to refresh URL after 403 error');
                this.urlRefreshAttempted = true;
                
                let refreshedUrl = null;
                
                // Try refreshing via photoId first if available (most reliable)
                if (this.photoId) {
                  console.log('Attempting to fetch fresh URL using photo ID:', this.photoId);
                  refreshedUrl = await this.getPresignedUrl(this.photoId);
                } else {
                  // Fall back to the legacy method if photoId is not available
                  refreshedUrl = await this.checkAndRefreshPresignedUrl(sourceUrl);
                }
                
                if (refreshedUrl && refreshedUrl !== sourceUrl) {
                  console.log('URL was refreshed after 403, trying again with new URL');
                  this.photo = refreshedUrl;
                  directImg.src = refreshedUrl;  // Try the direct loading again with new URL
                  return; // Exit the current error handler to avoid showing error message
                }
              }
              
              throw new Error('Access denied. The photo link may have expired or you do not have permission.');
            } else if (response.status === 404) {
              throw new Error('The photo could not be found on the server.');
            } else if (response.status === 401) {
              console.error('Authentication error (401 Unauthorized)');
              throw new Error('Authentication error. Please log in again and try once more.');
            } else {
              throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
            }
          }
          
          const blob = await response.blob();
          console.log('Blob received:', blob.type, 'size:', blob.size);
          
          if (blob.size === 0) {
            throw new Error('Received empty blob data. The server may have returned an empty response.');
          }
          
          // Create a local URL for the blob
          const localUrl = URL.createObjectURL(blob);
          console.log('Created local URL:', localUrl);
          this.photo = localUrl;
          this.isLoading = false;
          
          // Load the image dimensions
          const img = new Image();
          img.onload = () => {
            this.originalWidth = img.width;
            this.originalHeight = img.height;
            this.aspectRatio = img.width / img.height;
            console.log('Image loaded successfully:', img.width, 'x', img.height);
            
            // Save to history as initial state if not already done
            if (this.imageHistory.length === 0) {
              this.saveToHistory();
            }
          };
          
          img.onerror = (error) => {
            console.error('Error loading image from blob URL:', error);
            this.loadError = true;
            this.isLoading = false;
            this.showErrorMessage('Unable to load the image properly. The image format may not be supported.');
          };
          
          img.src = localUrl;
        } catch (error) {
          console.error('Error fetching image:', error);
          this.loadError = true;
          this.isLoading = false;
          this.showErrorMessage(error.message || 'Error loading the photo. The URL may be expired or the server may have CORS restrictions.');
          
          // For debugging help in the console
          console.log('Source URL that failed:', sourceUrl);
          console.log('Error details:', error);
        }
      };
      
      // Start direct loading attempt with the sanitized URL
      directImg.src = sourceUrl;
      console.log('Started direct image loading with crossOrigin=anonymous');
    },
    
    activateTool(tool) {
      this.isCropping = false;
      this.rotationChanged = false;
      this.isAddingText = false;

      this.currentTool = tool;
  
      if (['brightness', 'contrast', 'blur', 'saturation'].includes(tool)) {
        this.originalAdjustments[tool] = this.adjustmentValues[tool];
      }     

      if (tool === 'crop') {
        this.startCropping();
      } else if (tool === 'resize') {
        this.prepareResize();
      } else if (tool === 'rotate') {
        this.rotationChanged = false;
      } else if (tool === 'text') {
        this.currentText = {
          content: 'Double click to edit',
          color: '#000000',
          size: 24,
          font: 'Arial',
          bold: false,
          italic: false,
          underline: false,
          x: 100,
          y: 100
        };
        this.activeTextIndex = null;
      }
    },
    
    // Cropping Methods
  async startCropping() {
    await this.loadCropper(); // Ensure Cropper is loaded
    
    this.isCropping = true;
    this.$nextTick(() => {
      const image = this.$refs.cropImage;
      if (!image) {
        console.error("Crop image reference not found!");
        return;
      }
      
      if (this.cropper) {
        this.cropper.destroy();
      }
      
      this.cropper = new window.Cropper(image, {
        aspectRatio: NaN, // Free aspect ratio
        viewMode: 1,
        autoCropArea: 0.8,
        responsive: true,
        movable: true,
        zoomable: true,
        rotatable: false,
        scalable: false,
        ready: () => {
          this.cropper.setDragMode('crop');
        }
      });
    });
  },

  saveCrop() {
    if (!this.cropper) return;
    
    try {
      const croppedCanvas = this.cropper.getCroppedCanvas({
        minWidth: 256,
        minHeight: 256,
        maxWidth: 4096,
        maxHeight: 4096,
        fillColor: '#fff'
      });
      
      if (croppedCanvas) {
        this.photo = croppedCanvas.toDataURL('image/jpeg', 0.9);
        this.saveToHistory();
        this.cancelCrop();
      }
    } catch (error) {
      console.error('Error while cropping:', error);
    }
  },

  cancelCrop() {
    this.isCropping = false;
    if (this.cropper) {
      this.cropper.destroy();
      this.cropper = null;
    }
    this.currentTool = null;
  },

    loadCropper() {
  return new Promise((resolve) => {
    if (window.Cropper) {
      resolve();
      return;
    }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/cropperjs@1.5.12/dist/cropper.min.js';
      script.onload = resolve;
      document.head.appendChild(script);

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/cropperjs@1.5.12/dist/cropper.min.css';
      document.head.appendChild(link);
    });
  },
    
    // Rotation Methods
    rotateImage(degrees) {
      this.currentRotation += degrees;
      this.rotationChanged = true;
    },
    saveRotation() {
      // Apply rotation permanently to the image
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Adjust canvas size based on rotation
        if (this.currentRotation % 180 !== 0) {
          canvas.width = img.height;
          canvas.height = img.width;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }
        
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(this.currentRotation * Math.PI / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        
        this.photo = canvas.toDataURL('image/jpeg', 0.9);
        this.currentRotation = 0;
        this.rotationChanged = false;
        this.currentTool = null;
      };
      img.src = this.photo;
    },
  cancelRotation() {
    this.currentRotation = 0;
    this.rotationChanged = false;
    this.currentTool = null;
    // Reset the image style to remove rotation
    this.$nextTick(() => {
      this.imageStyle.transform = 'rotate(0deg)';
    });
  },
    
    // Resize Methods
    prepareResize() {
      const img = new Image();
      img.onload = () => {
        this.originalWidth = img.width;
        this.originalHeight = img.height;
        this.aspectRatio = img.width / img.height;
        this.resizeWidth = img.width;
        this.resizeHeight = img.height;
      };
      img.src = this.photo;
    },
    updateHeight() {
      this.resizeHeight = Math.round(this.resizeWidth / this.aspectRatio);
    },
    updateWidth() {
      this.resizeWidth = Math.round(this.resizeHeight * this.aspectRatio);
    },
    saveResize() {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = this.resizeWidth;
        canvas.height = this.resizeHeight;
        const ctx = canvas.getContext('2d');
        
        // High-quality image scaling
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        this.photo = canvas.toDataURL('image/jpeg', 0.9);
        this.currentTool = null;
      };
      img.src = this.photo;
    },
    cancelResize() {
      this.currentTool = null;
    },
    
    // Adjustment Methods
    saveAdjustment() {
      // For adjustments, the changes are already applied in real-time
      // We just need to reset the tool
      this.currentTool = null;
    },
    
    cancelAdjustment() {
      if (this.currentTool && this.originalAdjustments[this.currentTool] !== undefined) {
        // Restore the original value for the current tool
        this.adjustmentValues[this.currentTool] = this.originalAdjustments[this.currentTool];
      }

          // Rebuild and apply the filter string
          const filters = [];
          if (this.adjustmentValues.brightness !== undefined) {
            filters.push(`brightness(${this.adjustmentValues.brightness}%)`);
          }
          if (this.adjustmentValues.contrast !== undefined) {
            filters.push(`contrast(${this.adjustmentValues.contrast}%)`);
          }
          if (this.adjustmentValues.blur !== undefined) {
            filters.push(`blur(${this.adjustmentValues.blur}px)`);
          }
          if (this.adjustmentValues.saturation !== undefined) {
            filters.push(`saturate(${this.adjustmentValues.saturation}%)`);
          }

          this.imageStyle.filter = filters.join(' ');

          // Clear current tool and trigger UI update
          this.currentTool = null;
          this.$forceUpdate();
        },

    // Text Methods
    addText() {
      // Prevent empty text or double addition
      if (!this.currentText.content.trim() || this.isAddingText) return;
      
      this.isAddingText = true;
      
      // If editing existing text
      if (this.activeTextIndex !== null) {
        this.textElements[this.activeTextIndex] = { ...this.currentText };
      } 
      // If adding new text
      else {
        // Only add if content is not the default placeholder
        if (this.currentText.content !== "Double click to edit") {
          this.textElements.push({ ...this.currentText });
        }
      }
      
      this.resetTextState();
    },

    editText(index) {
      this.currentTool = 'text';
      this.activeTextIndex = index;
      this.currentText = { ...this.textElements[index] };
    },

    resetTextState() {
      this.currentText = {
        content: '',
        color: '#000000',
        size: 24,
        font: 'Arial',
        bold: false,
        italic: false,
        underline: false,
        x: 100,
        y: 100
      };
      this.activeTextIndex = null;
      this.currentTool = null;
      this.isAddingText = false;
    },

    deleteText() {
        if (this.activeTextIndex !== null) {
        this.textElements.splice(this.activeTextIndex, 1);
        this.currentTool = null;
        this.activeTextIndex = null;
        }
    },

    updateActiveText() {
        if (this.activeTextIndex !== null) {
        this.textElements[this.activeTextIndex] = {
            ...this.textElements[this.activeTextIndex],
            content: this.currentText.content,
            color: this.currentText.color,
            size: this.currentText.size
        };
        }
    },    cancelText() {
        this.currentTool = null;
        this.activeTextIndex = null;
    },

    startTextDrag(e, index) {
        if (this.currentTool === 'text') return;
        
        e.preventDefault();
        this.isDraggingText = true;
        this.activeTextIndex = index;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.textStartX = this.textElements[index].x;
        this.textStartY = this.textElements[index].y;
        
        document.addEventListener('mousemove', this.handleTextDrag);
        document.addEventListener('mouseup', this.stopTextDrag);
    },

    handleTextDrag(e) {
        if (!this.isDraggingText) return;
        e.preventDefault();
        
        const dx = e.clientX - this.dragStartX;
        const dy = e.clientY - this.dragStartY;
        
        this.textElements[this.activeTextIndex].x = this.textStartX + dx;
        this.textElements[this.activeTextIndex].y = this.textStartY + dy;
    },

    stopTextDrag() {
        this.isDraggingText = false;
        document.removeEventListener('mousemove', this.handleTextDrag);
        document.removeEventListener('mouseup', this.stopTextDrag);
    },

    async removeBackground() {
      if (!this.photo) return;
      
      // Store original photo before processing
      this.originalPhotoBeforeBgRemoval = this.photo;
      this.bgProcessing = true;
      this.bgRemovalActive = true;
      
      try {
        // Simple client-side background removal (replace with your API call if needed)
        await this.simpleBackgroundRemoval();
      } catch (error) {
        console.error('Background removal failed:', error);
        this.undoBgRemoval();
      } finally {
        this.bgProcessing = false;
      }
    },

    simpleBackgroundRemoval() {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          for (let i = 0; i < data.length; i += 4) {
            // Calculate brightness
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            // If pixel is brighter than threshold, make it transparent
            if (brightness > this.bgRemovalThreshold) {
              data[i + 3] = 0; // Set alpha to 0 (transparent)
            }
          }
          
          ctx.putImageData(imageData, 0, 0);
          this.photo = canvas.toDataURL('image/png'); // Must use PNG for transparency
          resolve();
        };
        img.src = this.photo;
      });
    },

    undoBgRemoval() {
      if (this.originalPhotoBeforeBgRemoval) {
        this.photo = this.originalPhotoBeforeBgRemoval;
      }
      this.bgRemovalActive = false;
      this.bgProcessing = false;
    },

    cancelBackground() {
      this.undoBgRemoval();
      this.currentTool = null;
    },    saveBackgroundChange() {
      this.saveToHistory(); // Save to your undo history
      this.bgRemovalActive = false;
      this.currentTool = null;
    },

    // Save Image    // Set output format and update UI
    setOutputFormat(format) {
      this.outputFormat = format;
    },    // Save and return to previous screen with the edited image
    saveWithOptions(action) {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        // Apply all edits
        ctx.filter = `
          brightness(${this.adjustmentValues.brightness}%) 
          contrast(${this.adjustmentValues.contrast}%) 
          blur(${this.adjustmentValues.blur}px)
          saturate(${this.adjustmentValues.saturation}%)
        `;
        
        ctx.drawImage(img, 0, 0);
        ctx.filter = 'none';
        
        // Draw text elements
        this.textElements.forEach(text => {
          ctx.font = `${text.size}px ${text.font}`;
          ctx.fillStyle = text.color;
          ctx.fillText(text.content, text.x, text.y);
        });
        
        // Set default quality based on format
        let quality;
        if (this.outputFormat === 'jpeg') {
          quality = 0.9; // 90% quality for JPEG
        } else if (this.outputFormat === 'webp') {
          quality = 0.85; // 85% quality for WebP
        }
        
        // Get the edited image data
        const mimeType = `image/${this.outputFormat}`;
        const dataUrl = canvas.toDataURL(mimeType, quality);
        
        // Store the dataUrl for later use
        this.editedPhotoDataUrl = dataUrl;
        
        // Get original name and suggest a new one
        const originalName = this.$route.query.name || `image.${this.outputFormat}`;
        this.originalPhotoName = originalName;
        
        // Suggest a new filename with "edited-" prefix
        let suggestedName = originalName;
        if (suggestedName.includes('.')) {
          const baseName = suggestedName.substring(0, suggestedName.lastIndexOf('.'));
          const ext = this.outputFormat;
          
          // If name already has "edited" in it, don't add it again
          if (baseName.toLowerCase().includes('edited')) {
            suggestedName = `${baseName}.${ext}`;
          } else {
            // Add timestamp to make name unique
            const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            suggestedName = `${baseName}-edited-${timestamp}.${ext}`;
          }
        } else {
          suggestedName = `${suggestedName}-edited.${this.outputFormat}`;
        }
        
        this.newPhotoName = suggestedName;
        
        // Open the rename modal
        this.isRenameModalOpen = true;
      };
      img.src = this.photo;
    },
    
    // Cancel the save operation
    cancelSave() {
      this.isRenameModalOpen = false;
      this.editedPhotoDataUrl = null;
      this.errorMessage = null;
    },
    
    // Confirm the save with the new name
    async confirmSaveWithName() {
      if (!this.newPhotoName.trim()) {
        this.errorMessage = "Photo name cannot be empty";
        return;
      }
      
      if (!this.editedPhotoDataUrl) {
        this.errorMessage = "No edited image data available";
        return;
      }
      
      this.isLoading = true;
      this.errorMessage = null;
      
      try {
        // Ensure the filename has the correct extension
        let filename = this.newPhotoName;
        if (!filename.toLowerCase().endsWith(`.${this.outputFormat}`)) {
          const baseName = filename.includes('.') 
            ? filename.substring(0, filename.lastIndexOf('.')) 
            : filename;
          filename = `${baseName}.${this.outputFormat}`;
        }
        
        // Convert dataURL to blob
        const fetchResponse = await fetch(this.editedPhotoDataUrl);
        const blob = await fetchResponse.blob();
        
        // Create a File object from the blob
        const mimeType = `image/${this.outputFormat}`;
        const file = new File([blob], filename, { type: mimeType });        // Check if this is a group photo edit
        const groupId = this.$route.query.groupId;
        const isGroupPhoto = groupId != null;
        
        if (isGroupPhoto) {
          // For group photos, upload as a new photo (same as individual photos)
          // This preserves the original photo and adds the edited version as a new photo
          await this.uploadEditedPhotoToGroup(file, groupId);
          
          // Navigate back to group photos with refresh flag
          this.$router.push({
            path: `/groups/${groupId}/photos`,
            query: { 
              refreshPhotos: 'true',
              timestamp: Date.now(), // Add timestamp to prevent caching
              groupName: this.$route.query.groupName,
              groupDescription: this.$route.query.groupDescription
            }
          });
        } else {
          // For regular photos, upload as a new photo
          await this.uploadEditedPhoto(file);
          
          // Navigate to dashboard with a flag to refresh the photos
          this.$router.push({
            path: '/dashboard',
            query: { 
              refreshPhotos: 'true',
              timestamp: Date.now() // Add timestamp to prevent caching
            }
          });
        }
      } catch (error) {
        console.error('Error uploading edited photo:', error);
        this.errorMessage = error.message || 'Failed to upload the edited photo. Please try again.';
        this.isLoading = false;
      }
    },
    
    // Upload the edited photo
    async uploadEditedPhoto(file) {
      try {
        // Show loading state
        this.isLoading = true;
        
        // Read file as base64
        const base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            // Get only the base64 part (remove data:image/jpeg;base64, prefix)
            resolve(e.target.result.split(',')[1]);
          };
          reader.readAsDataURL(file);
        });
        
        // Ensure token is valid
        await authService.ensureValidToken();
        const token = authService.getIdToken();
        if (!token) {
          throw new Error("Authentication token not available. Please log in again.");
        }
        
        // Get current user ID
        const user = await authService.getCurrentUser();
        if (!user || !user.id) {
          throw new Error("User ID not available. Please log in again.");
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
              type: file.type,
              isEdited: true,
              originalPhotoId: this.photoId || null
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
        console.log("Edited photo uploaded successfully:", result);
        return result;
      } catch (error) {
        console.error("Error uploading edited photo:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    // Upload the edited photo to a group (preserves original)
    async uploadEditedPhotoToGroup(file, groupId) {
      try {
        // Show loading state
        this.isLoading = true;
        
        // Read file as base64
        const base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            // Get only the base64 part (remove data:image/jpeg;base64, prefix)
            resolve(e.target.result.split(',')[1]);
          };
          reader.readAsDataURL(file);
        });
        
        // Ensure token is valid
        await authService.ensureValidToken();
        const token = authService.getIdToken();
        if (!token) {
          throw new Error("Authentication token not available. Please log in again.");
        }
        
        // Get current user ID
        const user = await authService.getCurrentUser();
        if (!user || !user.id) {
          throw new Error("User ID not available. Please log in again.");
        }
        
        // Upload to group using the group photo upload API
        const response = await fetch('https://fk96bt7fv3.execute-api.ap-southeast-5.amazonaws.com/pixDeployment/groups/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            groupId: groupId,
            userId: user.id,
            photoName: file.name,
            photoBase64: base64Image,
            metadata: {
              size: file.size,
              type: file.type,
              isEdited: true,
              originalPhotoId: this.photoId || null
            }
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Group photo upload failed:", errorText);
          throw new Error(`Upload failed with status ${response.status}`);
        }
        
        // Parse successful result
        const result = await response.json();
        console.log("Edited group photo uploaded successfully:", result);
        return result;
      } catch (error) {
        console.error("Error uploading edited group photo:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
      
    // Legacy method for backward compatibility
    saveAndReturn() {
      this.saveWithOptions('return');
    },
    
    // Generate a unique filename adding a timestamp
    generateUniqueFilename(baseName, extension) {
      const timestamp = new Date().toISOString()
        .replace(/[-:]/g, '')
        .replace('T', '-')
        .split('.')[0];
      return `${baseName}-${timestamp}.${extension}`;
    },
    
    // Update tool apply methods to be consistent
    applyTool() {
      if (this.currentTool === 'crop') this.saveCrop();
      else if (this.currentTool === 'rotate') this.saveRotation();
      else if (this.currentTool === 'resize') this.saveResize();
      else if (this.currentTool === 'text') this.addText();
      else if (this.currentTool === 'background') this.removeBackground();
      else this.saveAdjustment();
    },
    
    // Method missing from original code
    saveToHistory() {
      // Create a copy for history
      this.imageHistory = this.imageHistory.slice(0, this.historyIndex + 1);
      this.imageHistory.push(this.photo);
      this.historyIndex = this.imageHistory.length - 1;
    }
  },
  mounted() {
    // Load Cropper library if not already loaded
    if (!window.Cropper) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/cropperjs@1.5.12/dist/cropper.min.js';
      document.head.appendChild(script);
      
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/cropperjs@1.5.12/dist/cropper.min.css';
      document.head.appendChild(link);
    }
      // Check if we have a photoId (preferred) or photo URL (legacy) in the route query
    if (this.$route.query.photoId) {
      console.log('Photo ID found in route:', this.$route.query.photoId);
      this.loadImageWithCorsHandling();
    } 
    else if (this.$route.query.photo) {
      console.warn('No photoId provided but found direct URL (legacy mode):', {
        photoUrl: this.$route.query.photo.substring(0, 50) + '...' // Log truncated URL for privacy
      });
      this.loadImageWithCorsHandling();
    } 
    else {
      console.error('No photo ID or URL provided in route query');
      this.showErrorMessage('No photo information provided. Please select a photo from the dashboard.');
    }
  },
  beforeUnmount() {
    // Clean up any object URLs to prevent memory leaks
    if (this.photo && this.photo.startsWith('blob:')) {
      console.log('Cleaning up object URL:', this.photo);
      URL.revokeObjectURL(this.photo);
    }
    
    // Clean up any loaded cropper instance
    if (this.cropper) {
      this.cropper.destroy();
      this.cropper = null;
    }
  },
}
</script>

<style scoped>
.tool-btn {
  background-color: #f3f4f6;
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.tool-btn:hover {
  background-color: #e5e7eb;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #1f2937;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background-color: #d1d5db;
}

.btn-rotate {
  background-color: #f3f4f6;
  color: #1f2937;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.btn-rotate:hover {
  background-color: #e5e7eb;
}

.image-container {
  position: relative;
  max-width: 100%;
  max-height: 70vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  margin: 0 auto;
}

.editor-image {
  object-fit: contain;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

/* Custom range input styles */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
}

/* Cropper.js overrides */
:deep(.cropper-view-box),
:deep(.cropper-face) {
  border-radius: 0;
}

:deep(.cropper-view-box) {
  outline: 1px solid #3b82f6;
  outline-color: rgba(59, 130, 246, 0.75);
}

:deep(.cropper-line) {
  background-color: #3b82f6;
}

:deep(.cropper-point) {
  background-color: #3b82f6;
  width: 8px;
  height: 8px;
  opacity: 1;
}

:deep(.cropper-dashed) {
  border-color: transparent;
}

.selection-overlay {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 20;
}

/* Additional Cropper.js overrides */
:deep(.cropper-view-box),
:deep(.cropper-face) {
  border-radius: 0;
}

:deep(.cropper-view-box) {
  outline: 1px solid #3b82f6;
  outline-color: rgba(59, 130, 246, 0.75);
}

:deep(.cropper-line) {
  background-color: #3b82f6;
}
</style>