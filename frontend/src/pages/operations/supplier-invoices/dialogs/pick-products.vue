<script setup lang="ts">
import type { ICategory, IProduct } from '~/types/information'
import { Icon } from '@iconify/vue'
import { computed, ref, watch } from 'vue'
import SelectionProductsContainer from './selection-products-container.vue'

interface ProductWithQuantity extends IProduct {
  quantity: number
  price: number
  category?: ICategory
}

const emit = defineEmits<{
  save: [products: ProductWithQuantity[]]
  close: []
}>()

const categoriesStore = useCategoriesStore()
const productsStore = useProductsStore()
const showDialog = ref(false)

const categories = ref<ICategory[]>([])
const products = ref<IProduct[]>([])
const pickedProducts = ref<ProductWithQuantity[]>([])
const selectedCategory = ref<ICategory | null>(null)
const searchQuery = ref('')
const loading = ref(false)

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(15)

// Performance optimization: debounce search
const debouncedSearchQuery = ref('')
let searchTimeout: NodeJS.Timeout | null = null

const { t } = useI18n({ useScope: 'global' })

// Computed properties
const filteredProducts = computed(() => {
  let filtered = products.value

  // Filter by search query only (category filtering is now done on API level)
  if (debouncedSearchQuery.value.trim()) {
    const query = debouncedSearchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(query)
      || product.description?.toLowerCase().includes(query),
    )
  }

  return filtered
})

const tableData = computed(() => {
  const allData = filteredProducts.value.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category?.name || '-',
    unit: product.unit,
    quantity: isProductPicked(product.id) ? getPickedProduct(product.id)?.quantity || 1 : null,
    price: isProductPicked(product.id) ? getPickedProduct(product.id)?.price || 0 : null,
    isPicked: isProductPicked(product.id),
    product,
  }))

  // Apply pagination
  const startIndex = (currentPage.value - 1) * itemsPerPage.value
  const endIndex = startIndex + itemsPerPage.value
  return allData.slice(startIndex, endIndex)
})

const tableColumns = [
  { key: 'name', label: 'table.columns.name', translatable: true },
  { key: 'quantity', label: 'table.columns.quantity', width: '120px', translatable: true },
  { key: 'price', label: 'table.columns.price', width: '120px', translatable: true },
  { key: 'actions', label: 'table.columns.actions', width: '150px', translatable: true },
]

const allCategories = computed(() => [
  { id: null, name: t('categories.all_categories'), active: true },
  ...categories.value,
])

// Pagination configuration
const paginationConfig = computed(() => {
  const totalItems = filteredProducts.value.length
  const totalPages = Math.ceil(totalItems / itemsPerPage.value)
  const startItem = ((currentPage.value - 1) * itemsPerPage.value) + 1
  const endItem = Math.min(currentPage.value * itemsPerPage.value, totalItems)

  return {
    currentPage: currentPage.value,
    totalPages,
    totalItems,
    itemsPerPage: itemsPerPage.value,
    startItem,
    endItem,
  }
})

// Methods
async function loadData() {
  loading.value = true
  try {
    await Promise.all([
      loadCategories(),
      loadProducts(),
    ])
  }
  catch (error) {
    console.error('Error loading data:', error)
  }
  finally {
    loading.value = false
  }
}

async function loadCategories() {
  try {
    const result = await categoriesStore.fetchActiveCategories()
    categories.value = result || []
  }
  catch (error) {
    console.error('Error loading categories:', error)
  }
}

async function loadProducts(categoryId?: number) {
  try {
    const options: any = { status: 'active' }
    if (categoryId) {
      options.categoryId = categoryId
    }
    await productsStore.fetchProducts(options)
    products.value = productsStore.products || []
  }
  catch (error) {
    console.error('Error loading products:', error)
  }
}

function selectCategory(category: ICategory) {
  selectedCategory.value = category
  currentPage.value = 1 // Reset to first page when category changes
  // Fetch products for the selected category
  loadProducts(category.id || undefined)
}

function handlePageChange(page: number) {
  currentPage.value = page
}

function handleProductRemove(productId: number) {
  removeProduct(productId)
}

function handleSelectionSave(products: ProductWithQuantity[]) {
  emit('save', products)
  handleClose()
}

function addProduct(product: IProduct) {
  const existingIndex = pickedProducts.value.findIndex(p => p.id === product.id)

  if (existingIndex >= 0) {
    pickedProducts.value[existingIndex].quantity += 1
  }
  else {
    pickedProducts.value.push({
      ...product,
      quantity: 1,
      price: 0,
      category: product.category,
    })
  }
}

function removeProduct(productId: number) {
  const index = pickedProducts.value.findIndex(p => p.id === productId)
  if (index >= 0) {
    pickedProducts.value.splice(index, 1)
  }
}

function updateQuantity(productId: number, quantity: number) {
  const product = pickedProducts.value.find(p => p.id === productId)
  if (product) {
    if (quantity <= 0) {
      removeProduct(productId)
    }
    else {
      product.quantity = quantity
    }
  }
}

function updatePrice(productId: number, price: number) {
  const product = pickedProducts.value.find(p => p.id === productId)
  if (product) {
    product.price = Math.max(0, price)
  }
}

function isProductPicked(productId: number) {
  return pickedProducts.value.some(p => p.id === productId)
}

function getPickedProduct(productId: number) {
  return pickedProducts.value.find(p => p.id === productId)
}

function handleClose() {
  pickedProducts.value = []
  selectedCategory.value = null
  searchQuery.value = ''
  debouncedSearchQuery.value = ''
  currentPage.value = 1
  if (searchTimeout) {
    clearTimeout(searchTimeout)
    searchTimeout = null
  }
  showDialog.value = false
}

// Reset pagination when search query changes
watch(searchQuery, (newValue) => {
  currentPage.value = 1
  // Debounce search for better performance
  debounceSearch(newValue)
}, { immediate: false })

// Debounce search implementation
function debounceSearch(value: string) {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    debouncedSearchQuery.value = value
  }, 300)
}

// Reset pagination when debounced search changes
watch(debouncedSearchQuery, () => {
  currentPage.value = 1
})

function open(selectedProducts: ProductWithQuantity[] = []) {
  pickedProducts.value = selectedProducts.map(product => ({
    ...product,
    quantity: product.quantity || 1,
    price: product.price || 0,
    category: product.category || undefined,
  }))
  selectedCategory.value = null
  searchQuery.value = ''
  debouncedSearchQuery.value = ''
  currentPage.value = 1
  // Reset pagination
  itemsPerPage.value = 15
  // Reset loading state
  loading.value = false
  // Open dialog
  if (pickedProducts.value.length > 0) {
    selectedCategory.value = pickedProducts.value[0].category || null
  }
  if (selectedCategory.value) {
    loadProducts(selectedCategory.value.id)
  }
  else {
    loadProducts()
  }
  loadData()
  showDialog.value = true
}

defineExpose({
  open,
})
</script>

<template>
  <MDialog v-model="showDialog" size="fullscreen" :closable="true" @close="handleClose">
    <template #header>
      <div class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
        <h2 class="text-lg text-gray-900 font-semibold dark:text-white">
          {{ t('products.pick_products') }}
        </h2>
        <div class="flex items-center gap-2">
          <MButton color="secondary" @click="handleClose">
            {{ t('button.cancel') }}
          </MButton>
          <MButton
            color="primary"
            :disabled="pickedProducts.length === 0"
            prepend-icon="ri-check-line"
            @click="handleSelectionSave(pickedProducts)"
          >
            {{ t('button.save') }}
          </MButton>
        </div>
      </div>
    </template>
    <div class="h-full max-h-screen flex flex-col">
      <!-- Main content area -->
      <div class="min-h-0 flex flex-1 gap-4 py-4">
        <!-- Left sidebar - Categories -->
        <div
          class="w-64 flex-shrink-0 border border-gray-200 rounded-lg bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="h-full flex flex-col rounded-lg bg-white dark:bg-gray-900">
            <div
              class="flex-shrink-0 border-b border-gray-200 bg-gray-50 px-4 py-3 text-4 text-gray-700 font-medium dark:border-gray-700 dark:bg-gray-700 dark:text-gray-400"
            >
              {{ t('categories.categories') }}
            </div>
            <div class="min-h-0 flex-1 overflow-y-auto px-2 py-2">
              <div class="space-y-1">
                <button
                  v-for="category in allCategories" :key="category.id || 'all'"
                  class="w-full rounded-md px-3 py-2 text-left text-sm transition-colors" :class="[
                    selectedCategory?.id === category.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
                  ]" @click="selectCategory(category as ICategory)"
                >
                  {{ category.name }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Center content - Products -->
        <div class="min-w-0 flex flex-1 flex-col">
          <div class="flex-shrink-0 px-4">
            <div class="mb-4 flex items-center justify-between gap-2">
              <div class="flex-1">
                <MInput
                  v-model="searchQuery" :placeholder="t('products.search_products')"
                  prepend-icon="ri-search-line" clearable
                />
              </div>
            </div>
          </div>
          <!-- Products table -->
          <div class="min-h-0 flex-1 overflow-hidden px-4">
            <div class="flex-1">
              <div v-if="loading" class="h-32 flex items-center justify-center">
                <Icon icon="ri-loader-4-line" class="animate-spin text-2xl text-gray-400" />
              </div>
              <div
                v-else-if="filteredProducts.length === 0"
                class="h-32 flex items-center justify-center text-gray-500 dark:text-gray-400"
              >
                {{ t('products.no_products_found') }}
              </div>
              <div v-else class="relative h-full pb-4">
                <MDataTable
                  :pagination="paginationConfig" :data="tableData" :columns="tableColumns"
                  :loading="loading" @page-change="handlePageChange"
                >
                  <template #name="{ row }">
                    <!-- Product Details -->
                    <div class="min-w-0 flex-1">
                      <h4 class="truncate text-sm text-gray-900 font-medium dark:text-white">
                        {{ row.product.name }}
                      </h4>
                      <!-- Category and Unit Badges -->
                      <div class="mt-1 flex flex-wrap gap-1">
                        <span class="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700 font-medium dark:bg-gray-700 dark:text-gray-300">
                          <Icon icon="ri-folder-line" class="mr-1 h-2 w-2" />
                          {{ row.product.category?.name || 'No Category' }}
                        </span>
                        <span class="inline-flex items-center rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700 font-medium dark:bg-blue-900 dark:text-blue-300">
                          <Icon icon="ri-ruler-line" class="mr-1 h-2 w-2" />
                          {{ row.product.unit || "" }}
                        </span>
                      </div>
                    </div>
                  </template>
                  <template #quantity="{ row }">
                    <div v-if="row.isPicked" class="w-20">
                      <MInput
                        :model-value="row.quantity" type="number" min="1" size="sm"
                        @update:model-value="(value) => updateQuantity(Number(row.id), Number(value))"
                      />
                    </div>
                    <span v-else class="text-sm text-gray-400">-</span>
                  </template>

                  <template #price="{ row }">
                    <div v-if="row.isPicked" class="w-24">
                      <MInput
                        :model-value="row.price" type="number" min="0" step="0.01" size="sm"
                        @update:model-value="(value) => updatePrice(Number(row.id), Number(value))"
                      />
                    </div>
                    <span v-else class="text-sm text-gray-400">-</span>
                  </template>

                  <template #actions="{ row }">
                    <div class="flex items-center justify-center gap-2">
                      <MButton
                        v-if="!row.isPicked" icon-button icon="ri-add-line" color="primary"
                        @click="addProduct(row.product)"
                      >
                        {{ t('button.add') }}
                      </MButton>
                      <MButton
                        v-else icon-button icon="ri-delete-bin-line" color="error"
                        @click="removeProduct(Number(row.id))"
                      >
                        {{ t('button.remove') }}
                      </MButton>
                    </div>
                  </template>
                </MDataTable>
              </div>
            </div>
          </div>
        </div>

        <!-- Right sidebar - Selected Products -->
        <div class="w-80 flex-shrink-0">
          <div class="h-full overflow-hidden">
            <SelectionProductsContainer
              :products="pickedProducts"
              @remove-product="handleProductRemove"
              @update-quantity="updateQuantity"
              @update-price="updatePrice"
            />
          </div>
        </div>
      </div>
    </div>
  </MDialog>
</template>

<style scoped>
/* Enhanced scrollbar styling for better performance */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
  transition: background 0.2s ease;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}

/* Dark mode scrollbar */
.dark .overflow-y-auto {
  scrollbar-color: rgba(75, 85, 99, 0.6) transparent;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.6);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.8);
}

/* Optimize scroll behavior */
.overflow-y-auto,
.overflow-hidden {
  scroll-behavior: smooth;
  overscroll-behavior: contain;
}

/* Performance optimizations for containers */
.min-h-0 {
  contain: layout style paint;
}

.flex-1 {
  will-change: scroll-position;
}

/* Category button hover optimization */
.transition-colors {
  will-change: background-color, color;
}

/* Better mobile scroll momentum */
@media (max-width: 768px) {
  .overflow-y-auto {
    -webkit-overflow-scrolling: touch;
  }

  /* Reduce animations on mobile for better performance */
  .transition-colors {
    transition-duration: 0.1s;
  }
}

/* Optimize table rendering */
.MDataTable {
  contain: layout style;
}

/* Smooth focus transitions */
.MInput:focus-within {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hardware acceleration for animations */
.MButton {
  transform: translateZ(0);
  will-change: transform;
}

/* Prevent layout shifts */
.w-20,
.w-24,
.w-64,
.w-80 {
  flex-shrink: 0;
}

/* Optimize dialog backdrop */
.MDialog {
  contain: layout style;
}

/* Enhance scroll performance for large lists */
.h-full.overflow-y-auto {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
</style>
