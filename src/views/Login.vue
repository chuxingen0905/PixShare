<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-sm space-y-6 bg-white p-8 rounded-xl shadow-lg">
      <div class="text-center">
        <h1 class="text-3xl font-semibold text-gray-800">Sign in</h1>
      </div>      <form @submit.prevent="handleLogin" class="space-y-4">
        <input v-model="email" type="email" placeholder="Email" class="input-field" required />
        <input v-model="password" type="password" placeholder="Password" class="input-field" required />
        
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <p v-if="success" class="text-green-500 text-sm">{{ success }}</p>
        
        <button 
          type="submit" 
          :disabled="loading"
          class="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {{ loading ? 'Signing in...' : 'Login' }}
        </button>
      </form>
      <div class="text-center text-sm">
        <router-link to="/register" class="text-blue-600 hover:underline">Create account</router-link>
        <span class="mx-1">·</span>
        <router-link to="/forgot" class="text-blue-600 hover:underline">Forgot password?</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '../services/auth.js'

export default {
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      error: '',
      success: ''
    }
  },
  async mounted() {
    // Check if user is already authenticated
    const isAuth = await authService.isAuthenticated()
    if (isAuth) {
      this.$router.push('/dashboard')
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true
      this.error = ''

      try {
        const result = await authService.login(this.email, this.password)
        
        if (result.success) {
          this.success = 'Login successful! Redirecting...'
          setTimeout(() => {
            this.$router.push('/dashboard')
          }, 1000)
        } else {
          this.error = result.error || 'Login failed'
        }
      } catch (error) {
        this.error = 'Login failed. Please check your credentials.'
        console.error('Login error:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
