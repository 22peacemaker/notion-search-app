<template>
  <div>
    <div class="mb-4 flex space-x-2">
      <button @click="loadDatabases" class="btn btn-secondary" :disabled="loadingDatabases">
        <span v-if="loadingDatabases" class="loading loading-spinner loading-sm"></span> Refresh Databases
      </button>
      <span v-if="errorDatabases" class="text-red-500">{{ errorDatabases }}</span>
      <select v-model="selectedDb" class="select select-bordered">
        <option disabled value="">Select a database</option>
        <option v-for="db in databases" :key="db.id" :value="db.id">{{ db.name }}</option>
      </select>
      <button @click="addWidget" class="btn btn-primary" :disabled="!selectedDb">Add Widget</button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <DatabaseWidget v-for="db in dbWidgets" :key="db.id" :database="{ id: db.id, name: db.name }" />
    </div>
    <div v-if="!dbWidgets.length" class="text-gray-500 mt-4">No widgets added yet.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../supabaseClient'
import DatabaseWidget from './DatabaseWidget.vue'

type DbInfo = { id: string; name: string }

const databases = ref<DbInfo[]>([])
const selectedDb = ref<string>('')
const dbWidgets = ref<DbInfo[]>([])
const loadingDatabases = ref(false)
const errorDatabases = ref('')

async function loadDatabases() {
  loadingDatabases.value = true
  errorDatabases.value = ''
  try {
    const res = await fetch('/api/notion/listDatabases')
    if (!res.ok) throw new Error('Failed to load')
    const json = await res.json()
    databases.value = json.databases
  } catch {
    errorDatabases.value = 'Could not fetch databases.'
  } finally {
    loadingDatabases.value = false
  }
}

async function loadWidgets() {
  const user = (await supabase.auth.getUser()).data.user
  const { data } = await supabase
    .from('notion_databases')
    .select('database_id, database_name')
    .eq('user_id', user?.id)
  dbWidgets.value = data?.map(r => ({ id: r.database_id, name: r.database_name })) || []
}

async function addWidget() {
  const db = databases.value.find(d => d.id === selectedDb.value)
  if (!db) return
  const user = (await supabase.auth.getUser()).data.user
  await supabase.from('notion_databases').insert({ user_id: user?.id, database_id: db.id, database_name: db.name })
  dbWidgets.value.push(db)
  selectedDb.value = ''
}

onMounted(() => {
  loadDatabases()
  loadWidgets()
})
</script>
