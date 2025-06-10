<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-sm space-y-6 bg-white p-8 rounded-xl shadow-lg">
      <div class="text-center">
        <h1 class="text-3xl font-semibold text-gray-800">
          {{ showConfirmation ? 'Verify Email' : 'Create your account' }}
        </h1>
      </div>

      <!-- Registration Form -->
      <form v-if="!showConfirmation" @submit.prevent="handleRegister" class="space-y-4">
        <input v-model="username" type="text" placeholder="Username" class="input-field" required />
        <input v-model="email" type="email" placeholder="Email" class="input-field" required />
        <input v-model="password" type="password" placeholder="Password" class="input-field" required />
        <input v-model="confirmPassword" type="password" placeholder="Confirm Password" class="input-field" required />
        
        <p v-if="password && !isPasswordValid" class="text-red-500 text-sm">
          Password must be at least 8 characters, include 1 number, 1 uppercase letter, and 1 special character.
        </p>
        
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <p v-if="success" class="text-green-500 text-sm">{{ success }}</p>
        
        <button 
          type="submit" 
          :disabled="!isPasswordValid || loading" 
          class="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {{ loading ? 'Creating Account...' : 'Sign Up' }}
        </button>
      </form>

      <!-- Email Verification Form -->
      <form v-if="showConfirmation" @submit.prevent="handleEmailVerification" class="space-y-4">
        <p class="text-sm text-gray-600 mb-4">
          We sent a verification code to <strong>{{ email }}</strong>
        </p>
        
        <input 
          v-model="verificationCode" 
          type="text" 
          placeholder="Enter verification code" 
          class="input-field" 
          required 
        />
        
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <p v-if="success" class="text-green-500 text-sm">{{ success }}</p>
        
        <button 
          type="submit" 
          :disabled="loading" 
          class="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {{ loading ? 'Verifying...' : 'Verify Email' }}
        </button>
        
        <button 
          type="button" 
          @click="resendCode" 
          :disabled="loading"
          class="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600 disabled:opacity-50"
        >
          {{ loading ? 'Sending...' : 'Resend Code' }}
        </button>
      </form>

      <div class="text-center text-sm">
        <router-link to="/login" class="text-blue-600 hover:underline">Already have an account?</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '../services/auth.js'

export default {
  data() {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      loading: false,
      showConfirmation: false,
      verificationCode: '',
      error: '',
      success: ''
    }
  },
  computed: {
    isPasswordValid() {
      const pattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/
      return pattern.test(this.password)
    }
  },
  methods: {
    async handleRegister() {
      if (this.password !== this.confirmPassword) {
        this.error = 'Passwords do not match!'
        return
      }
      if (!this.isPasswordValid) {
        this.error = 'Password format is invalid!'
        return
      }
      if (!this.username) {
        this.error = 'Username is required!'
        return
      }

      this.loading = true
      this.error = ''

      try {
        const result = await authService.register(this.email, this.password, this.username)
        
        if (result.success) {
          if (result.isSignUpComplete) {
            this.success = 'Registration successful! You can now login.'
            setTimeout(() => {
              this.$router.push('/login')
            }, 2000)
          } else {
            this.showConfirmation = true
            this.success = 'Please check your email for verification code.'
          }
        } else {
          this.error = result.error
        }
      } catch (error) {
        this.error = 'Registration failed. Please try again.'
        console.error('Registration error:', error)
      } finally {
        this.loading = false
      }
    },

    async handleEmailVerification() {
      if (!this.verificationCode) {
        this.error = 'Please enter verification code'
        return
      }

      this.loading = true
      this.error = ''

      try {
        const result = await authService.confirmEmail(this.username, this.verificationCode)
        
        if (result.success) {
          this.success = 'Email verified successfully! Redirecting to login...'
          setTimeout(() => {
            this.$router.push('/login')
          }, 2000)
        } else {
          this.error = result.error
        }
      } catch (error) {
        this.error = 'Verification failed. Please try again.'
        console.error('Verification error:', error)
      } finally {
        this.loading = false
      }
    },

    async resendCode() {
      this.loading = true
      this.error = ''

      try {
        const result = await authService.resendCode(this.username)
        
        if (result.success) {
          this.success = 'Verification code sent!'
        } else {
          this.error = result.error
        }
      } catch (error) {
        this.error = 'Failed to resend code. Please try again.'
        console.error('Resend code error:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.input-field {
  @apply w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500;
}
</style>
