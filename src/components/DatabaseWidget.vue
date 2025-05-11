<template>
  <div class="p-4 bg-white rounded shadow">
    <h2 class="text-xl font-semibold mb-2">{{ database.name }}</h2>
    <div v-if="loadingSchema" class="text-gray-500">Loading schema...</div>
    <div v-else-if="schemaError" class="text-red-500">Failed to load schema</div>
    <div v-else>
      <FilterBuilder :properties="schemaProps" @apply="fetchData" />
      <div v-if="loadingPages" class="text-gray-500 mt-2">Loading results...</div>
      <div v-else-if="errorPages" class="text-red-500 mt-2">{{ errorPages }}</div>
      <ul v-else class="mt-4 space-y-2">
        <li v-for="page in pages" :key="page.id" class="border-b pb-2">
          {{ page.properties.Name?.title[0]?.plain_text || 'Untitled' }}
        </li>
      </ul>
      <div class="flex justify-between items-center mt-4">
        <button @click="prevPage" :disabled="!prevCursor" class="btn btn-sm">Previous</button>
        <select v-model.number="pageSize" class="select select-bordered select-sm">
          <option v-for="n in [5,10,20]" :key="n" :value="n">{{ n }}</option>
        </select>
        <button @click="nextPage" :disabled="!hasMore" class="btn btn-sm">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import FilterBuilder from './FilterBuilder.vue'
import type { PropertySchema } from '../types'

interface Props { database: { id: string; name: string } }
const props = defineProps<Props>()

const pages = ref<any[]>([])
const schemaProps = ref<PropertySchema[]>([])
const loadingSchema = ref(true)
const schemaError = ref(false)
const loadingPages = ref(false)
const errorPages = ref('')
const nextCursor = ref<string | null>(null)
const prevCursor = ref<string | null>(null)
const hasMore = ref(false)
const sortProp = ref<string>('')
const sortDir = ref<'ascending'|'descending'>('ascending')
const pageSize = ref<number>(10)
const cursorStack: string[] = []

async function loadSchema() {
  try {
    const res = await fetch('/api/notion/getDatabaseSchema', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ database_id: props.database.id })
    })
    const json = await res.json()
    schemaProps.value = Object.entries(json.properties).map(([name, info]: any) => ({
      name, type: info.type
    }))
    loadingSchema.value = false
  } catch {
    schemaError.value = true
    loadingSchema.value = false
  }
}

async function fetchData(filterObject: any = {}) {
  loadingPages.value = true
  errorPages.value = ''
  const body = {
    database_id: props.database.id,
    filter: filterObject,
    page_size: pageSize.value,
    start_cursor: cursorStack.length ? cursorStack[cursorStack.length - 1] : undefined,
    sorts: sortProp.value ? [{ property: sortProp.value, direction: sortDir.value }] : undefined
  }
  try {
    const res = await fetch('/api/notion/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const json = await res.json()
    pages.value = json.results || []
    hasMore.value = json.has_more
    prevCursor.value = cursorStack.length ? cursorStack[cursorStack.length - 1] : null
    if (json.next_cursor) {
      cursorStack.push(json.next_cursor)
      nextCursor.value = json.next_cursor
    }
  } catch {
    errorPages.value = 'Failed to load results.'
  } finally {
    loadingPages.value = false
  }
}

function nextPage() { if (nextCursor.value) fetchData() }
function prevPage() {
  if (cursorStack.length > 1) {
    cursorStack.pop()
    nextPage()
  }
}

onMounted(() => {
  loadSchema()
})
</script>
