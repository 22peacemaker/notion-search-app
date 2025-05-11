<template>
  <div class="max-w-md mx-auto bg-white p-6 rounded shadow">
    <h1 class="text-2xl mb-4">Sign Up</h1>
    <input v-model="email" placeholder="Email" type="email" class="input input-bordered w-full mb-2" />
    <input v-model="password" placeholder="Password" type="password" class="input input-bordered w-full mb-2" />
    <button @click="signUp" class="btn btn-secondary w-full mb-2" :disabled="loading">
      <span v-if="loading" class="loading loading-spinner loading-sm"></span> Create Account
    </button>
    <p v-if="message" class="text-sm text-center text-green-500">{{ message }}</p>
    <p v-if="errorMsg" class="text-sm text-center text-red-500">{{ errorMsg }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '../supabaseClient'

const email = ref('')
const password = ref('')
const message = ref('')
const errorMsg = ref('')
const loading = ref(false)

async function signUp() {
  message.value = ''
  errorMsg.value = ''
  loading.value = true
  const { error } = await supabase.auth.signUp({ email: email.value, password: password.value })
  loading.value = false
  if (error) errorMsg.value = error.message
  else message.value = 'Check your email to confirm your account!'
}
</script>
