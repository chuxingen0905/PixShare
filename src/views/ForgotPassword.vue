<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="max-w-sm w-full p-8 bg-white rounded-xl shadow">
      <h2 class="text-2xl font-semibold text-center mb-4">Reset your password</h2>
      <form @submit.prevent="handleReset" class="space-y-4">
        <input v-model="email" type="email" placeholder="Enter your email" class="input-field" required />
        <button type="submit" class="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Send Reset Link</button>
      </form>
      <p v-if="sent" class="text-green-500 mt-2 text-sm text-center">Reset link sent to your email</p>
      <router-link to="/login" class="text-sm text-blue-600 hover:underline block text-center mt-4">Back to Login</router-link>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      sent: false
    }
  },
  methods: {
    handleReset() {
      this.sent = true
    }
  }
}
</script>

<style scoped>
.input-field {
  @apply w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500;
}
</style>
