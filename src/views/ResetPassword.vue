<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="max-w-sm w-full p-8 bg-white rounded-xl shadow">
      <h2 class="text-2xl font-semibold text-center mb-4">Set New Password</h2>
      
      <!-- Success message -->
      <div v-if="successMessage" class="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-center">
        {{ successMessage }}
      </div>
      
      <!-- Error message -->
      <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center">
        {{ errorMessage }}
      </div>
      
      <p class="text-sm text-gray-600 mb-4 text-center">
        Enter the verification code sent to <strong>{{ email }}</strong> and your new password
      </p>
      
      <form @submit.prevent="handleReset" class="space-y-4">
        <div>
          <label for="code" class="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
          <input 
            id="code"
            v-model="code" 
            type="text" 
            placeholder="Enter 6-digit code" 
            class="input-field" 
            required 
            :disabled="isLoading"
            pattern="[0-9]*"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input 
            id="password"
            v-model="password" 
            type="password" 
            placeholder="Minimum 8 characters" 
            class="input-field" 
            required 
            :disabled="isLoading"
            minlength="8"
          />
          <p class="text-xs text-gray-500 mt-1">Password must be at least 8 characters</p>
        </div>
        
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input 
            id="confirmPassword"
            v-model="confirmPassword" 
            type="password" 
            placeholder="Re-enter your password" 
            class="input-field" 
            required 
            :disabled="isLoading"
          />
          <p v-if="passwordMismatch" class="text-xs text-red-500 mt-1">Passwords do not match</p>
        </div>
        
        <button 
          type="submit" 
          class="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-400 mt-2"
          :disabled="isLoading || passwordMismatch || !isFormValid"
        >
          <span v-if="isLoading" class="inline-block">
            <svg class="animate-spin h-5 w-5 text-white inline-block mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          {{ isLoading ? 'Resetting...' : 'Reset Password' }}
        </button>
      </form>
      
      <div class="text-center mt-6">
        <router-link to="/forgot" class="text-sm text-blue-600 hover:underline">
          Resend code
        </router-link>
        <span class="mx-1">·</span>
        <router-link to="/login" class="text-sm text-blue-600 hover:underline">
          Back to Login
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '../services/auth.js';

export default {
  props: {
    email: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      code: '',
      password: '',
      confirmPassword: '',
      isLoading: false,
      successMessage: '',
      errorMessage: ''
    }
  },
  computed: {
    passwordMismatch() {
      return this.password && this.confirmPassword && this.password !== this.confirmPassword;
    },
    isFormValid() {
      return this.code && this.password && this.confirmPassword && this.password === this.confirmPassword && this.password.length >= 8;
    }
  },
  methods: {
    async handleReset() {
      if (!this.isFormValid) return;
      
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      try {
        const result = await authService.confirmPasswordReset(this.email, this.code, this.password);
        
        if (result.success) {
          this.successMessage = result.message || 'Password reset successful!';
          
          // Navigate back to login after successful reset
          setTimeout(() => {
            this.$router.push('/login');
          }, 2000);
        } else {
          this.errorMessage = result.error || 'Failed to reset password';
        }
      } catch (error) {
        console.error('Error confirming password reset:', error);
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
