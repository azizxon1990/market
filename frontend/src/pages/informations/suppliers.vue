<script setup lang="ts">
defineOptions({
  name: 'Suppliers',
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
    <div class="mx-auto max-w-6xl">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="mb-2 text-3xl text-gray-900 font-bold dark:text-white">
          {{ $t('suppliers.title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ $t('suppliers.description') }}
        </p>
      </div>

      <!-- Coming Soon Message -->
      <div class="py-12 text-center">
        <div class="mx-auto mb-4 h-24 w-24 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <svg class="h-12 w-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 class="mb-2 text-lg text-gray-900 font-medium dark:text-white">
          Suppliers Management
        </h3>
        <p class="text-gray-500 dark:text-gray-400">
          This feature is coming soon. Suppliers management will be available here.
        </p>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  published: false
</route>
