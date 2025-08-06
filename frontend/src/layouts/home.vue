<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <Sidebar />
    <!-- Top navigation with user controls -->
    <div class="lg:ml-64">
      <Navigation />
      <!-- Main content -->
      <main class="mx-auto max-w-7xl px-4 py-8 lg:px-8 sm:px-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
