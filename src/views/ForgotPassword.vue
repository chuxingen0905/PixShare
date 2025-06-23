<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="max-w-sm w-full p-8 bg-white rounded-xl shadow">
      <h2 class="text-2xl font-semibold text-center mb-4">Reset your password</h2>
      
      <!-- Success message -->
      <div v-if="successMessage" class="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-center">
        {{ successMessage }}
      </div>
      
      <!-- Error message -->
      <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center">
        {{ errorMessage }}
      </div>
      
      <form @submit.prevent="handleReset" class="space-y-4">
        <input v-model="email" 
               type="email" 
               placeholder="Enter your email" 
               class="input-field" 
               required 
               :disabled="isLoading" />
               
        <button 
          type="submit" 
          class="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
          :disabled="isLoading || !email"
        >
          <span v-if="isLoading" class="inline-block">
            <svg class="animate-spin h-5 w-5 text-white inline-block mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          {{ isLoading ? 'Sending...' : 'Send Reset Code' }}
        </button>
      </form>
      
      <router-link to="/login" class="text-sm text-blue-600 hover:underline block text-center mt-6">
        Back to Login
      </router-link>
    </div>
  </div>
</template>

<script>
import authService from '../services/auth.js';

export default {
  data() {
    return {
      email: '',
      isLoading: false,
      successMessage: '',
      errorMessage: '',
    }
  },
  methods: {
    async handleReset() {
      if (!this.email) return;
      
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      try {
        const result = await authService.forgotPassword(this.email);
        
        if (result.success) {
          this.successMessage = result.message || 'Password reset code sent to your email!';
          
          // Navigate to reset password page after a short delay
          setTimeout(() => {
            this.$router.push({
              name: 'ResetPassword',
              params: { email: this.email }
            });
          }, 2000);
        } else {
          this.errorMessage = result.error || 'Failed to send reset code';
        }
      } catch (error) {
        console.error('Error requesting password reset:', error);
        this.errorMessage = error.message || 'An unexpected error occurred';
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

<style scoped>
.input-field {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}
.input-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
}
</style>
