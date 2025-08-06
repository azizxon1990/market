<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  pagination: {
    type: Object as PropType<PaginationData>,
    required: true,
  },
})

const emit = defineEmits<{
  pageChange: [page: number]
}>()

const { t } = useI18n()

interface PaginationData {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  startItem: number
  endItem: number
}

function goToPage(page: number) {
  if (page >= 1 && page <= props.pagination.totalPages) {
    emit('pageChange', page)
  }
}

function previousPage() {
  if (props.pagination.currentPage > 1) {
    goToPage(props.pagination.currentPage - 1)
  }
}

function nextPage() {
  if (props.pagination.currentPage < props.pagination.totalPages) {
    goToPage(props.pagination.currentPage + 1)
  }
}

function getVisiblePages() {
  const current = props.pagination.currentPage
  const total = props.pagination.totalPages
  const pages: (number | string)[] = []

  if (total <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  }
  else {
    // Always show first page
    pages.push(1)

    if (current > 3) {
      pages.push('...')
    }

    // Show pages around current
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (current < total - 2) {
      pages.push('...')
    }

    // Always show last page
    if (total > 1) {
      pages.push(total)
    }
  }

  return pages
}
</script>

<template>
  <nav class="bottom-0 h-17 flex flex-col items-start justify-between border-t p-4 md:flex-row md:items-center space-y-3 md:space-y-0" :aria-label="t('pagination.navigation')">
    <!-- Results Info -->
    <span class="text-sm text-gray-500 font-normal dark:text-gray-400">
      {{ t('pagination.showing') }}
      <span class="text-gray-900 font-semibold dark:text-white">{{ pagination.startItem }}-{{ pagination.endItem }}</span>
      {{ t('pagination.of') }}
      <span class="text-gray-900 font-semibold dark:text-white">{{ pagination.totalItems }}</span>
    </span>

    <!-- Pagination Controls -->
    <ul class="inline-flex items-stretch -space-x-px">
      <!-- Previous Button -->
      <li>
        <button
          :disabled="pagination.currentPage <= 1"
          class="ml-0 h-full flex items-center justify-center border border-gray-300 rounded-l-lg bg-white px-3 py-1.5 text-gray-500 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-100 dark:text-gray-400 hover:text-gray-700 disabled:opacity-50 dark:hover:bg-gray-700 dark:hover:text-white"
          @click="previousPage"
        >
          <span class="sr-only">{{ t('pagination.previous') }}</span>
          <svg class="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </li>

      <!-- Page Numbers -->
      <li v-for="page in getVisiblePages()" :key="page">
        <button
          v-if="typeof page === 'number'"
          class="flex items-center justify-center border border-gray-300 px-3 py-2 text-sm leading-tight" :class="[
            page === pagination.currentPage
              ? 'z-10 border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white'
              : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white',
          ]"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <span
          v-else
          class="flex items-center justify-center border border-gray-300 bg-white px-3 py-2 text-sm text-gray-500 leading-tight dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
        >
          {{ page }}
        </span>
      </li>

      <!-- Next Button -->
      <li>
        <button
          :disabled="pagination.currentPage >= pagination.totalPages"
          class="h-full flex items-center justify-center border border-gray-300 rounded-r-lg bg-white px-3 py-1.5 text-gray-500 leading-tight disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-100 dark:text-gray-400 hover:text-gray-700 disabled:opacity-50 dark:hover:bg-gray-700 dark:hover:text-white"
          @click="nextPage"
        >
          <span class="sr-only">{{ t('pagination.next') }}</span>
          <svg class="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </li>
    </ul>
  </nav>
</template>
