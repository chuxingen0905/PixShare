<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-sm space-y-6 bg-white p-8 rounded-xl shadow-lg">
      <div class="text-center">
        <h1 class="text-3xl font-semibold text-gray-800">Sign in</h1>
      </div>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <input v-model="email" type="email" placeholder="Email" class="input-field" required />
        <input v-model="password" type="password" placeholder="Password" class="input-field" required />
        <button type="submit" class="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Login</button>
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
export default {
  data() {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    handleLogin() {
      const user = localStorage.getItem('user')
      if (!user) {
        alert('No account found. Please register.')
        return
      }
      this.$router.push('/dashboard')
    }
  }
}
</script>
