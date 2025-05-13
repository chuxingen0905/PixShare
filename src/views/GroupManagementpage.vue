<template>
  <div class="flex min-h-screen bg-blue-50">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content Area -->
    <main class="flex-1 p-6 overflow-auto">
      <div class="max-w-6xl mx-auto">
        <div class="mb-8 flex justify-between items-center">
          <h1 class="text-2xl font-bold text-blue-900">Group Management</h1>
        </div>
        
        <!-- Existing GroupManagement component -->
        <GroupManagement />
      </div>
    </main>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue';
import GroupManagement from './GroupManagement.vue';

export default {
  components: {
    Sidebar,
    GroupManagement
  }
};
</script>
