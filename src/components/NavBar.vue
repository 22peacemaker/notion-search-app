<template>
  <div class="flex justify-between items-center p-3 bg-base-100 rounded shadow">
    <div>Hello, {{ user.email }}</div>
    <div class="space-x-2">
      <button @click="toggleDark" class="btn btn-sm">🌓</button>
      <button @click="connectNotion" class="btn btn-outline btn-sm">Connect Notion</button>
      <button @click="$emit('logout')" class="btn btn-error btn-sm">Logout</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'
type Props = { user: { email: string } }
const props = defineProps<Props>()

const clientId = import.meta.env.VITE_NOTION_CLIENT_ID as string
const redirectUri = encodeURIComponent(import.meta.env.VITE_NOTION_REDIRECT_URI as string)

function toggleDark() {
  document.documentElement.classList.toggle('dark')
}

function connectNotion() {
  const state = crypto.randomUUID()
  document.cookie = `notion_oauth_state=${state}; path=/; secure; samesite=strict`
  const url = `https://api.notion.com/v1/oauth/authorize?owner=user&client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&state=${state}`
  window.location.href = url
}
</script>
