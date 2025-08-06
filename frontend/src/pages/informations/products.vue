<script setup lang="ts">
defineOptions({
  name: 'Products',
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
    <div class="mx-auto max-w-6xl">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="mb-2 text-3xl text-gray-900 font-bold dark:text-white">
          {{ $t('products.title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ $t('products.description') }}
        </p>
      </div>

      <!-- Coming Soon Message -->
      <div class="py-12 text-center">
        <div class="mx-auto mb-4 h-24 w-24 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
          <svg class="h-12 w-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
          </svg>
        </div>
        <h3 class="mb-2 text-lg text-gray-900 font-medium dark:text-white">
          Products Management
        </h3>
        <p class="text-gray-500 dark:text-gray-400">
          This feature is coming soon. Products management will be available here.
        </p>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  published: false
</route>
