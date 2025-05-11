<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div v-if="mode === 'login'">
      <div v-if="!user" class="max-w-md mx-auto bg-white p-6 rounded shadow">
        <h1 class="text-2xl mb-4">Log In</h1>
        <input v-model="email" placeholder="Email" type="email" class="input input-bordered w-full mb-2" />
        <input v-model="password" placeholder="Password" type="password" class="input input-bordered w-full mb-4" />
        <button @click="signIn" class="btn btn-primary w-full">Log In</button>
        <p class="mt-4 text-sm text-center">
          Don't have an account? <a @click="mode = 'signup'" class="text-blue-500 hover:underline cursor-pointer">Sign up</a>
        </p>
      </div>
    </div>
    <div v-else>
      <SignUp />
      <p class="mt-4 text-sm text-center">
        Already have an account? <a @click="mode = 'login'" class="text-blue-500 hover:underline cursor-pointer">Log in</a>
      </p>
    </div>
    <div v-if="user">
      <NavBar :user="user" @logout="signOut" />
      <main class="mt-6">
        <h1 class="text-3xl mb-4">Notion Dashboard</h1>
        <NotionDashboard />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from './supabaseClient'
import NavBar from './components/NavBar.vue'
import NotionDashboard from './components/NotionDashboard.vue'
import SignUp from './components/SignUp.vue'

type User = { id: string; email: string }

const user = ref<User | null>(null)
const email = ref('')
const password = ref('')
const mode = ref<'login' | 'signup'>('login')

onMounted(async () => {
  const { data } = await supabase.auth.getUser()
  user.value = data.user as User | null
})

async function signIn() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })
  if (error) alert(error.message)
  else user.value = data.user as User
}

async function signOut() {
  await supabase.auth.signOut()
  user.value = null
  mode.value = 'login'
}
</script>
