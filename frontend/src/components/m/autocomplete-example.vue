<script setup lang="ts">
import { ref } from 'vue'
import MAutocomplete from './autocomplete.vue'

// Example data
const options = ref([
  { id: 1, label: 'Apple', value: 'apple' },
  { id: 2, label: 'Banana', value: 'banana' },
  { id: 3, label: 'Cherry', value: 'cherry' },
  { id: 4, label: 'Date', value: 'date' },
  { id: 5, label: 'Elderberry', value: 'elderberry' },
  { id: 6, label: 'Fig', value: 'fig' },
  { id: 7, label: 'Grape', value: 'grape' },
])

// Single selection
const singleValue = ref('')
const multipleValues = ref([])
const customValue = ref('')
const loading = ref(false)

// Methods
function handleSearch(query: string) {
  console.log('Search query:', query)
  // You can implement async search here
}

function handleSelect(option: any) {
  console.log('Selected option:', option)
}

function handleCreate(value: string) {
  console.log('Create custom value:', value)
  // Add custom option to the list
  const newOption = {
    id: Date.now(),
    label: value,
    value: value.toLowerCase().replace(/\s+/g, '_'),
  }
  options.value.push(newOption)
  customValue.value = newOption.value
}

function simulateLoading() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 2000)
}
</script>

<template>
  <div class="p-6 space-y-6">
    <h1 class="mb-6 text-2xl font-bold">
      MAutocomplete Examples
    </h1>

    <!-- Basic Single Selection -->
    <div>
      <h2 class="mb-2 text-lg font-semibold">
        Basic Single Selection
      </h2>
      <MAutocomplete
        v-model="singleValue"
        label="Choose a fruit"
        :options="options"
        placeholder="Select a fruit..."
        @select="handleSelect"
        @search="handleSearch"
      />
      <p class="mt-2 text-sm text-gray-600">
        Selected: {{ singleValue }}
      </p>
    </div>

    <!-- Multiple Selection -->
    <div>
      <h2 class="mb-2 text-lg font-semibold">
        Multiple Selection
      </h2>
      <MAutocomplete
        v-model="multipleValues"
        label="Choose fruits"
        :options="options"
        placeholder="Select multiple fruits..."
        multiple
        @select="handleSelect"
        @search="handleSearch"
      />
      <p class="mt-2 text-sm text-gray-600">
        Selected: {{ multipleValues }}
      </p>
    </div>

    <!-- With Icons -->
    <div>
      <h2 class="mb-2 text-lg font-semibold">
        With Icons
      </h2>
      <MAutocomplete
        v-model="singleValue"
        label="Search with icon"
        :options="options"
        placeholder="Search fruits..."
        prepend-icon="ri-search-line"
        append-icon="ri-star-line"
        @select="handleSelect"
        @search="handleSearch"
      />
    </div>

    <!-- Custom Values -->
    <div>
      <h2 class="mb-2 text-lg font-semibold">
        Allow Custom Values
      </h2>
      <MAutocomplete
        v-model="customValue"
        label="Add or select fruit"
        :options="options"
        placeholder="Type to search or create..."
        allow-custom-value
        custom-value-text="Add '{query}' as new fruit"
        @select="handleSelect"
        @search="handleSearch"
        @create="handleCreate"
      />
      <p class="mt-2 text-sm text-gray-600">
        Selected: {{ customValue }}
      </p>
    </div>

    <!-- Loading State -->
    <div>
      <h2 class="mb-2 text-lg font-semibold">
        Loading State
      </h2>
      <MAutocomplete
        v-model="singleValue"
        label="Loading example"
        :options="options"
        placeholder="Click button to simulate loading..."
        :loading="loading"
        loading-text="Searching..."
      />
      <button
        class="mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        @click="simulateLoading"
      >
        Simulate Loading
      </button>
    </div>

    <!-- Disabled State -->
    <div>
      <h2 class="mb-2 text-lg font-semibold">
        Disabled State
      </h2>
      <MAutocomplete
        v-model="singleValue"
        label="Disabled autocomplete"
        :options="options"
        placeholder="This is disabled..."
        disabled
      />
    </div>

    <!-- Size Variants -->
    <div>
      <h2 class="mb-2 text-lg font-semibold">
        Size Variants
      </h2>
      <div class="space-y-4">
        <MAutocomplete
          v-model="singleValue"
          label="Small size"
          :options="options"
          size="sm"
          placeholder="Small autocomplete..."
        />
        <MAutocomplete
          v-model="singleValue"
          label="Medium size (default)"
          :options="options"
          size="md"
          placeholder="Medium autocomplete..."
        />
        <MAutocomplete
          v-model="singleValue"
          label="Large size"
          :options="options"
          size="lg"
          placeholder="Large autocomplete..."
        />
      </div>
    </div>
  </div>
</template>
