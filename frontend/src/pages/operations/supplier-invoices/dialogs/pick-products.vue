<script setup lang="ts">
import type { ICategory, IProduct } from '~/types/information'
import { Icon } from '@iconify/vue'
import { computed, onMounted, ref, watch } from 'vue'
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

const { t } = useI18n({ useScope: 'global' })

// Computed properties
const filteredProducts = computed(() => {
  let filtered = products.value

  // Filter by search query only (category filtering is now done on API level)
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
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
  { key: 'product.name', label: 'table.columns.name', translatable: true },
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
  currentPage.value = 1
  showDialog.value = false
}

// Reset pagination when search query changes
watch(searchQuery, () => {
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
    <div class="h-full flex flex-col overflow-hidden">
      <!-- Main content area -->
      <div class="min-h-0 flex flex-1 py-4">
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
            <div class="flex-1 overflow-y-auto px-2 py-2">
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
          <div class="flex-shrink-0">
            <div class="mb-2 flex items-center justify-between gap-2 px-4">
              <div class="flex-1">
                <MInput
                  v-model="searchQuery" :placeholder="t('products.search_products')"
                  prepend-icon="ri-search-line" clearable
                />
              </div>
            </div>
          </div>
          <!-- Products table -->
          <div class="flex-1 overflow-auto pl-4 pr-4">
            <div v-if="loading" class="h-32 flex items-center justify-center">
              <Icon icon="ri-loader-4-line" class="animate-spin text-2xl text-gray-400" />
            </div>
            <div
              v-else-if="filteredProducts.length === 0"
              class="h-32 flex items-center justify-center text-gray-500 dark:text-gray-400"
            >
              {{ t('products.no_products_found') }}
            </div>
            <MDataTable
              v-else :pagination="paginationConfig" :data="tableData" :columns="tableColumns"
              :loading="loading" @page-change="handlePageChange"
            >
              <template #name="{ row }">
                <div>
                  <div class="text-sm text-gray-900 font-medium dark:text-white">
                    {{ row.name }}
                  </div>
                  <div v-if="row.description" class="text-sm text-gray-500 dark:text-gray-400">
                    {{ row.description }}
                  </div>
                </div>
              </template>
              <template #product_name="{ row }">
                <!-- Product Details -->
                <div class="min-w-0 flex-1">
                  <h4 class="truncate text-sm text-gray-900 font-medium dark:text-white">
                    {{ row.product.name }}
                  </h4>
                  <!-- Category and Unit Badges -->
                  <div class="mt-1 flex flex-wrap gap-1">
                    <span class="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700 font-medium dark:bg-gray-700 dark:text-gray-300">
                      <Icon icon="ri-folder-line" class="mr-1 h-2 w-2" />
                      {{ row.product.category.name || '' }}
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

        <!-- Right sidebar - Selected Products -->
        <div class="w-80 flex-shrink-0">
          <SelectionProductsContainer
            :products="pickedProducts"
            @remove-product="handleProductRemove"
            @update-quantity="updateQuantity"
            @update-price="updatePrice"
          />
        </div>
      </div>
    </div>
  </MDialog>
</template>

<style scoped>
</style>
