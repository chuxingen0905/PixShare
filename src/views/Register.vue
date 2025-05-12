<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-sm space-y-6 bg-white p-8 rounded-xl shadow-lg">
      <div class="text-center">
        <h1 class="text-3xl font-semibold text-gray-800">Create your account</h1>
      </div>
      <form @submit.prevent="handleRegister" class="space-y-4">
        <input v-model="email" type="email" placeholder="Email" class="input-field" required />
        <input v-model="password" type="password" placeholder="Password" class="input-field" required />
        <input v-model="confirmPassword" type="password" placeholder="Confirm Password" class="input-field" required />
        <p v-if="password && !isPasswordValid" class="text-red-500 text-sm">
          Password must be at least 8 characters, include 1 number, 1 uppercase letter, and 1 special character.
        </p>
        <button type="submit" :disabled="!isPasswordValid" class="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-50">
          Sign Up
        </button>
      </form>
      <div class="text-center text-sm">
        <router-link to="/login" class="text-blue-600 hover:underline">Already have an account?</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      confirmPassword: '',
    }
  },
  computed: {
    isPasswordValid() {
      const pattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/
      return pattern.test(this.password)
    }
  },
  methods: {
    handleRegister() {
      if (this.password !== this.confirmPassword) {
        alert('Passwords do not match!')
        return
      }
      if (!this.isPasswordValid) {
        alert('Password format is invalid!')
        return
      }
      localStorage.setItem('user', JSON.stringify({ email: this.email }))
      this.$router.push('/dashboard')
    }
  }
}
</script>

<style scoped>
.input-field {
  @apply w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500;
}
</style>
