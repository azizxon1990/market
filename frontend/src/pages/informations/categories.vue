<script setup lang="ts">
import type { ICategory } from '~/types/information'
import { computed, onMounted, ref } from 'vue'
import { useCategoriesStore } from '~/stores/categories'
import AddOrEditDialog from './dialogs/categories/add-or-edit-dialog.vue'

defineOptions({
  name: 'CategoriesPage',
})

const categoriesStore = useCategoriesStore()
const dialogRef = ref<InstanceType<typeof AddOrEditDialog> | null>(null)
// Reactive data
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(50)
const paginationData = ref({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
  startItem: 0,
  endItem: 0,
})

// Table columns configuration
const columns = ref([
  { key: 'id', label: 'table.columns.id', width: '80px', translatable: true },
  { key: 'name', label: 'table.columns.name', translatable: true },
  { key: 'active', label: 'table.columns.status', width: '100px', translatable: true },
  { key: 'actions', label: 'table.columns.actions', width: '100px', translatable: true },
])

const categories = computed(() => categoriesStore.categories)

// Methods
async function fetchCategories() {
  try {
    const result = await categoriesStore.fetchCategories({
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: searchQuery.value || undefined,
    })

    if (result?.pagination) {
      paginationData.value = {
        currentPage: result.pagination.currentPage || currentPage.value,
        totalPages: result.pagination.totalPages || 1,
        totalItems: result.pagination.totalItems || 0,
        itemsPerPage: result.pagination.itemsPerPage || itemsPerPage.value,
        startItem: ((currentPage.value - 1) * itemsPerPage.value) + 1,
        endItem: Math.min(currentPage.value * itemsPerPage.value, result.pagination.totalItems || 0),
      }
    }
  }
  catch (error) {
    console.error('Error fetching categories:', error)
  }
}

function onPageChange(page: number) {
  currentPage.value = page
  fetchCategories()
}

function onSearch() {
  currentPage.value = 1
  fetchCategories()
}

// Dialog methods
function openAddDialog() {
  dialogRef.value?.open()
}

function openEditDialog(category: ICategory) {
  dialogRef.value?.open(category)
}

// Lifecycle
onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <MainPage class="h-full text-xs space-y-2 dark:bg-gray-700">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl text-gray-900 font-bold dark:text-white">
        {{ $t('categories.title') }}
      </h1>
    </div>

    <!-- Search -->
    <div class="w-full flex items-center justify-between gap-4">
      <MInput
        v-model="searchQuery"
        prepend-icon="ri-search-line"
        :placeholder="$t('categories.search_placeholder')"
        type="text"
        class="w-full"
        @keyup.enter="onSearch"
      />
      <MButton
        type="button"
        prepend-icon="ri-add-line"
        color="primary"
        @click="openAddDialog"
      >
        {{ $t('categories.add_category') }}
      </MButton>
    </div>
    <!-- Data Table -->
    <MDataTable
      :columns="columns"
      :data="categories"
      :pagination="paginationData"
      @page-change="onPageChange"
    >
      <template #active="{ row }">
        <span>{{ row.active ? $t('table.columns.active') : $t('table.columns.inactive') }}</span>
      </template>
      <template #actions="{ row }">
        <div class="flex items-center justify-center gap-2">
          <MButton
            icon-button
            icon="ri-edit-line"
            color="secondary"
            @click="openEditDialog(row as ICategory)"
          />
          <MSwitch
            v-model="row.active"
          />
        </div>
      </template>
    </MDataTable>

    <!-- Add/Edit Dialog -->
    <AddOrEditDialog ref="dialogRef" />
  </MainPage>
</template>

<route lang="yaml">
meta:
  published: false
</route>
