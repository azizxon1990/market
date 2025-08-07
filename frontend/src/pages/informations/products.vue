<script setup lang="ts">
import type { ICategory, IProduct } from '~/types/information'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import MAutocomplete from '~/components/m/autocomplete.vue'
import { useCategoriesStore } from '~/stores/categories'
import { useProductsStore } from '~/stores/products'
import { DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'
import AddOrEditDialog from './dialogs/products/add-or-edit-dialog.vue'

defineOptions({
  name: 'ProductsPage',
})

const { t } = useI18n()
const { showSuccess } = useToast()
const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()
const dialogRef = ref<InstanceType<typeof AddOrEditDialog> | null>(null)

// Reactive data
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(DEFAULT_ITEMS_PER_PAGE)
const selectedCategoryId = ref<number | null>(null)
const selectedStatus = ref<'active' | 'inactive' | ''>('')
const categories = ref<ICategory[]>([])
const paginationData = ref({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
  startItem: 0,
  endItem: 0,
})

// Table columns configuration
const columns = ref([
  { key: 'id', label: 'table.columns.id', width: '80px', translatable: true },
  { key: 'name', label: 'table.columns.name', translatable: true },
  { key: 'category', label: 'table.columns.category', width: '150px', translatable: true },
  { key: 'unit', label: 'table.columns.unit', width: '120px', translatable: true },
  { key: 'description', label: 'table.columns.description', translatable: true },
  { key: 'active', label: 'table.columns.status', width: '100px', translatable: true },
  { key: 'actions', label: 'table.columns.actions', width: '150px', translatable: true },
])

const products = computed(() => productsStore.products)

// Computed category options for autocomplete
const categoryOptions = computed(() => {
  const allOption = {
    id: 'all',
    label: t('products.all_categories'),
    value: null,
  }
  const categoryOpts = categories.value.map(category => ({
    id: category.id,
    label: category.name,
    value: category.id,
  }))
  return [allOption, ...categoryOpts]
})

// Computed status options for autocomplete
const statusOptions = computed(() => [
  {
    id: 'all',
    label: t('products.all_statuses'),
    value: '',
  },
  {
    id: 'active',
    label: t('table.columns.active'),
    value: 'active',
  },
  {
    id: 'inactive',
    label: t('table.columns.inactive'),
    value: 'inactive',
  },
])

// Methods
async function fetchProducts() {
  try {
    const result = await productsStore.fetchProducts({
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: searchQuery.value || undefined,
      status: selectedStatus.value || undefined,
      categoryId: selectedCategoryId.value || undefined,
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
    console.error('Error fetching products:', error)
  }
}

async function fetchCategories() {
  try {
    const result = await categoriesStore.fetchCategories({ status: 'active', limit: 1000 })
    categories.value = result?.categories || []
  }
  catch (error) {
    console.error('Error fetching categories:', error)
  }
}

function onPageChange(page: number) {
  currentPage.value = page
  fetchProducts()
}

function onSearch() {
  currentPage.value = 1
  fetchProducts()
}

function onCategoryChange() {
  currentPage.value = 1
  fetchProducts()
}

function onStatusChange() {
  currentPage.value = 1
  fetchProducts()
}

// Dialog methods
function openAddDialog() {
  dialogRef.value?.open()
}

function openEditDialog(product: IProduct) {
  dialogRef.value?.open(product)
}

// Toggle product status
async function toggleProductStatus(product: IProduct) {
  try {
    await productsStore.updateProduct({
      ...product,
      active: !product.active,
    })
  }
  catch (error) {
    console.error('Error updating product status:', error)
  }
}

// Import from Excel
function importFromExcel() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xlsx,.xls'
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
      handleExcelImport(file)
    }
  }
  input.click()
}

async function handleExcelImport(file: File) {
  try {
    const result = await productsStore.importFromExcel(file)

    if (result.results) {
      const { total, created, updated, errors } = result.results
      let message = `Import completed:\n`
      message += `Total rows: ${total}\n`
      message += `Created: ${created}\n`
      message += `Updated: ${updated}\n`

      if (errors.length > 0) {
        message += `\nErrors (${errors.length}):\n`
        message += errors.slice(0, 5).join('\n') // Show first 5 errors
        if (errors.length > 5) {
          message += `\n... and ${errors.length - 5} more errors`
        }
      }

      showSuccess({ message, title: t('products.import_from_excel') })

      // Refresh the products list
      fetchProducts()
    }
  }
  catch (error) {
    console.error('Error importing Excel file:', error)
  }
}

// Lifecycle
onMounted(() => {
  fetchProducts()
  fetchCategories()
})
</script>

<template>
  <MainPage class="h-full text-xs space-y-2 dark:bg-gray-700">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl text-gray-900 font-bold dark:text-white">
        {{ $t('products.title') }}
      </h1>
    </div>

    <!-- Filters -->
    <div class="w-full flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex flex-1 gap-4">
        <MInput
          v-model="searchQuery"
          prepend-icon="ri-search-line"
          :placeholder="$t('products.search_placeholder')"
          type="text"
          class="flex-1"
          @keyup.enter="onSearch"
        />

        <!-- Category Filter -->
        <div class="min-w-48">
          <MAutocomplete
            v-model="selectedCategoryId"
            :options="categoryOptions"
            :placeholder="$t('products.all_categories')"
            size="md"
            :clearable="false"
            prepend-icon="ri-folder-line"
            @update:model-value="onCategoryChange"
          />
        </div>

        <!-- Status Filter -->
        <div class="min-w-40">
          <MAutocomplete
            v-model="selectedStatus"
            :options="statusOptions"
            :placeholder="$t('products.all_statuses')"
            size="md"
            :clearable="false"
            prepend-icon="ri-toggle-line"
            @update:model-value="onStatusChange"
          />
        </div>
      </div>

      <div class="flex gap-2">
        <MButton
          type="button"
          prepend-icon="ri-file-excel-line"
          color="secondary"
          @click="importFromExcel"
        >
          {{ $t('products.import_from_excel') }}
        </MButton>
        <MButton
          type="button"
          prepend-icon="ri-add-line"
          color="primary"
          @click="openAddDialog"
        >
          {{ $t('products.add_product') }}
        </MButton>
      </div>
    </div>

    <!-- Data Table -->
    <MDataTable
      :columns="columns"
      :data="products"
      :pagination="paginationData"
      @page-change="onPageChange"
    >
      <template #category="{ row }">
        <span>{{ row.category?.name || '-' }}</span>
      </template>

      <template #description="{ row }">
        <span class="max-w-xs truncate" :title="row.description || ''">
          {{ row.description || '-' }}
        </span>
      </template>

      <template #active="{ row }">
        <span>{{ row.active ? $t('table.columns.active') : $t('table.columns.inactive') }}</span>
      </template>

      <template #actions="{ row }">
        <div class="flex items-center justify-center gap-2">
          <MButton
            icon-button
            icon="ri-edit-line"
            color="secondary"
            @click="openEditDialog(row as IProduct)"
          />
          <MSwitch
            :model-value="row.active"
            @update:model-value="toggleProductStatus(row as IProduct)"
          />
        </div>
      </template>
    </MDataTable>

    <!-- Add/Edit Dialog -->
    <AddOrEditDialog ref="dialogRef" @saved="fetchProducts" />
  </MainPage>
</template>

<route lang="yaml">
meta:
  published: false
</route>
