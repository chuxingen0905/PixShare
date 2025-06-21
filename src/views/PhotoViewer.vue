<!-- src/components/PhotoViewer.vue -->
<template>
  <div v-if="visible" class="fixed inset-0 z-50 bg-black bg-opacity-90 flex justify-center items-center">
    <div class="relative max-w-5xl w-full h-full flex flex-col items-center justify-center">
      <button @click="close" class="absolute top-4 right-4 text-white text-3xl">&times;</button>

      <img :src="photo.url || photo.src" alt="Full View" class="max-h-[80vh] max-w-full object-contain mb-4 rounded shadow" />

      <div class="flex space-x-4 mt-4">
        <button @click="download" class="btn">Download</button>
        <button @click="edit" class="btn">Edit</button>
        <button @click="share" class="btn">Share</button>
        <button @click="del" class="btn">Delete</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  visible: Boolean,
  photo: Object,
});
const emit = defineEmits(['close', 'download', 'edit', 'share', 'delete']);

const close = () => emit('close');
const download = () => emit('download', props.photo);
const edit = () => emit('edit', props.photo);
const share = () => emit('share', props.photo);
const del = () => emit('delete', props.photo);
</script>

<style scoped>
.btn {
  @apply bg-white text-black font-medium px-4 py-2 rounded hover:bg-gray-200 transition;
}
</style>
