<script setup lang="ts">
// Define types
interface TableColumn {
  key: string
  label: string
  width?: string
  align?: 'left' | 'center' | 'right'
  translatable?: boolean // Flag to indicate if label should be translated
}

// Props
const props = withDefaults(defineProps<{
  columns: TableColumn[]
  data: TableRow[]
  loading?: boolean
  pagination?: PaginationData | null
  striped?: boolean
  hover?: boolean
  size?: 'sm' | 'md' | 'lg'
}>(), {
  loading: false,
  pagination: null,
  striped: false,
  hover: true,
  size: 'md',
})

// Emits
const emit = defineEmits<{
  pageChange: [page: number]
  rowClick: [row: TableRow]
}>()

const { t } = useI18n()

interface TableRow {
  [key: string]: any
  id?: string | number
}

interface PaginationData {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  startItem: number
  endItem: number
}

// State - removed sorting state

// Computed
const hasData = computed(() => props.data.length > 0)
const showPagination = computed(() => props.pagination && hasData.value)

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-3 text-sm',
    lg: 'px-6 py-4 text-base',
  }
  return sizes[props.size]
})

// Methods
function handlePageChange(page: number) {
  emit('pageChange', page)
}

function handleRowClick(row: TableRow) {
  emit('rowClick', row)
}

function getColumnAlignment(column: TableColumn): string {
  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }
  return alignments[column.align || 'left']
}

function getColumnLabel(column: TableColumn): string {
  if (column.translatable) {
    return t(column.label)
  }
  return column.label
}

// Lazy load components for better performance
const MTablePagination = defineAsyncComponent(() => import('./table-pagination.vue'))
</script>

<template>
  <section class="relative h-full w-full overflow-hidden border border-gray-200 rounded-lg bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
    <!-- Main Container -->
    <div class="relative h-full overflow-auto rounded-lg bg-white shadow-md dark:bg-gray-800">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="h-12 w-12 animate-spin border-b-2 border-blue-500 rounded-full" />
      </div>

      <!-- Table -->
      <div v-else-if="hasData" class="overflow-x-auto" :class="showPagination ? 'h-[calc(100%-68px)]' : 'h-full'">
        <table class="relative w-full text-left text-gray-500 dark:text-gray-400" :class="sizeClasses">
          <!-- Table Header -->
          <thead class="sticky top-0 z-100 bg-gray-50 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th
                v-for="column in columns"
                :key="column.key"
                scope="col"
                :class="[
                  sizeClasses,
                  getColumnAlignment(column),
                ]"
                :style="{ width: column.width }"
              >
                <slot :name="`header(${column.key})`" :column="column">
                  {{ getColumnLabel(column) }}
                </slot>
              </th>
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody>
            <tr
              v-for="(row, index) in data"
              :key="row.id || index"
              class="border-b dark:border-gray-700"
              :class="[
                {
                  'hover:bg-gray-50 dark:hover:bg-gray-600': hover,
                  'bg-gray-50 dark:bg-gray-700': striped && index % 2 === 1,
                  'cursor-pointer': $attrs.onRowClick,
                },
              ]"
              @click="handleRowClick(row)"
            >
              <td
                v-for="column in columns"
                :key="column.key"
                :class="[
                  sizeClasses,
                  getColumnAlignment(column),
                  { 'font-medium text-gray-900 dark:text-white': column.key === 'name' },
                ]"
              >
                <!-- Column slot by key name -->
                <slot
                  :name="column.key"
                  :row="row"
                  :value="row[column.key]"
                  :column="column"
                >
                  <!-- Fallback to cell slot for backward compatibility -->
                  <slot
                    :name="`cell(${column.key})`"
                    :row="row"
                    :value="row[column.key]"
                    :column="column"
                  >
                    {{ row[column.key] }}
                  </slot>
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-else class="py-12 text-center">
        <div class="mx-auto mb-4 h-12 w-12 text-gray-400">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-6l-2 2h-4l-2-2H4" />
          </svg>
        </div>
        <h3 class="mb-2 text-lg text-gray-900 font-medium dark:text-white">
          {{ t('table.no_data_title') }}
        </h3>
        <p class="text-gray-500 dark:text-gray-400">
          {{ t('table.no_data_description') }}
        </p>
      </div>

      <!-- Pagination -->
      <MTablePagination
        v-if="showPagination"
        :pagination="pagination!"
        @page-change="handlePageChange"
      />
    </div>
  </section>
</template>
