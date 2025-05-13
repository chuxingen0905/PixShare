<template>
  <div class="min-h-screen bg-gray-100 p-6 flex">
    <!-- Tools Sidebar -->
    <div class="w-64 bg-white p-4 rounded-lg shadow mr-6">
      <header class="flex justify-between items-center mb-4">
        <h1 class="text-xl font-bold">Photo Editor</h1>
        <router-link to="/dashboard" class="text-blue-600 hover:underline">← Back</router-link>
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
        <!-- Exprot Section -->
      <div>
        <h2 class="text-lg font-semibold mb-2 flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
          </svg>
          Export
        </h2>
        <div class="grid grid-cols-2 gap-2">
          <button @click="saveImage('png')" class="tool-btn">
            Save as PNG
          </button>
          <button @click="saveImage('jpeg')" class="tool-btn">
            Save as JPEG
          </button>
          <button @click="saveImage('webp')" class="tool-btn">
            Save as WebP
          </button>
          <button @click="saveAndReturn" class="tool-btn bg-green-100 hover:bg-green-200">
            Save & Return
          </button>
        </div>
      </div>
      </div>
    </div>

    <!-- Main Editing Area -->
    <div class="flex-1 bg-white p-4 rounded-lg shadow flex flex-col">
      <!-- Image Display -->
      <div class="flex-1 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden relative">
        <div v-if="!isCropping" class="relative w-full h-full">
          <img
            ref="image"
            :src="photo"
            class="max-w-full max-h-[70vh] object-contain"
            :style="imageStyle"
            crossorigin="anonymous"
          />
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
        </div>

        <!-- Cropping Interface -->
        <div v-if="isCropping" class="w-full h-full flex items-center justify-center">
          <img
            ref="cropImage"
            :src="photo"
            class="max-w-full max-h-[70vh]"
            crossorigin="anonymous"
          />
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

        <div 
            v-for="(text, index) in textElements" 
            :key="index"
            class="absolute select-none"
            :style="{
                top: `${text.y}px`,
                left: `${text.x}px`,
                color: text.color,
                fontSize: `${text.size}px`,
                cursor: currentTool === 'text' ? 'default' : 'move',
                zIndex: 10
            }"
            @mousedown="startTextDrag($event, index)"
            @click="editText(index)"
            >
            {{ text.content }}
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
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>

export default {
  data() {
  return {
      // Image source and history management
      photo: this.$route.query.photo || '/assets/default.jpg',
      imageHistory: [],
      historyIndex: -1,
      originalPhotoBeforeBgRemoval: null,
      
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
      textStartY: 0,
      
      // Output/save options
      outputFormat: 'jpeg',
      outputQuality: 90
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
  },
  methods: {
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
    },

    cancelText() {
        this.currentTool = null;
        this.activeTextIndex = null;
    },

    editText(index) {
        this.currentTool = 'text';
        this.activeTextIndex = index;
        const text = this.textElements[index];
        this.currentText = {
            content: text.content,
            color: text.color,
            size: text.size
        };
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
    },

    saveBackgroundChange() {
      this.saveToHistory(); // Save to your undo history
      this.bgRemovalActive = false;
      this.currentTool = null;
    },

    // Save Image
    saveImage(format) {
      const img = new Image();
      img.onload = () => {
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

        // Convert to desired format
        const mimeType = `image/${format}`;
        const dataUrl = canvas.toDataURL(mimeType, 0.9);
        
        // Download the image
        const link = document.createElement('a');
        link.download = `edited-image.${format}`;
        link.href = dataUrl;
        link.click();
      };
      img.src = this.photo;
    },

    saveAndReturn() {
      const img = new Image();
      img.onload = () => {
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
        
        // Get the edited image data
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        // Return to dashboard with the edited image
        this.$router.push({
          path: '/dashboard',
          query: { 
            editedPhoto: dataUrl,
            originalName: this.$route.query.name || 'edited-image.jpg'
          }
        });
      };
      img.src = this.photo;
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

  mounted() {
    if (!window.Cropper) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/cropperjs@1.5.12/dist/cropper.min.js';
      document.head.appendChild(script);
      
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/cropperjs@1.5.12/dist/cropper.min.css';
      document.head.appendChild(link);
    }
    
    // Load the original image dimensions
    const img = new Image();
    img.onload = () => {
      this.originalWidth = img.width;
      this.originalHeight = img.height;
      this.aspectRatio = img.width / img.height;
    };
    img.src = this.photo;
  },
},
};
</script>

<style scoped>
.tool-btn {
  @apply bg-gray-100 text-sm px-3 py-2 rounded hover:bg-gray-200 w-full flex items-center justify-center transition-colors;
}

.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center transition-colors;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 flex items-center justify-center transition-colors;
}

.btn-rotate {
  @apply bg-gray-100 text-gray-800 p-2 rounded hover:bg-gray-200 transition-colors;
}

.image-container {
  position: relative;
  max-width: 100%;
  max-height: 70vh;
}

/* Custom range input styles */
input[type="range"] {
  -webkit-appearance: none;
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
</style>