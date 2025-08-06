<script setup lang="ts">

</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <Sidebar />
    <!-- Top navigation with user controls -->
    <div class="lg:ml-64">
      <Navigation />
      <!-- Main content -->
      <main class="relative h-[calc(100vh-64px)] w-full overflow-auto p-4 lg:p-6 sm:p-4">
        <RouterView />
      </main>
    </div>
  </div>
</template>
