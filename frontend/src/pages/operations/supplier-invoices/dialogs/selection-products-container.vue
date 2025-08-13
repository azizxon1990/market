<script setup lang="ts">
import type { IProduct } from '~/types/information'
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { useFormatting } from '~/composables/useFormatting'

interface ProductWithQuantity extends IProduct {
  quantity: number
  price: number
}

const props = defineProps<{
  products: ProductWithQuantity[]
}>()

const emit = defineEmits<{
  removeProduct: [productId: number]
  updateQuantity: [productId: number, quantity: number]
  updatePrice: [productId: number, price: number]
}>()

const { t } = useI18n({ useScope: 'global' })
const { formatCurrency } = useFormatting()

// Selection sidebar data
const selectionTableData = computed(() => {
  return props.products.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category?.name || '-',
    unit: product.unit,
    quantity: product.quantity,
    price: product.price,
    total: product.quantity * product.price,
    product,
  }))
})

const totalAmount = computed(() => {
  return props.products.reduce((sum, product) => sum + (product.quantity * product.price), 0)
})

function removeFromSelection(productId: number) {
  emit('removeProduct', productId)
}

function updateQuantity(productId: number, quantity: number) {
  if (quantity <= 0) {
    emit('removeProduct', productId)
  }
  else {
    emit('updateQuantity', productId, quantity)
  }
}

function updatePrice(productId: number, price: number) {
  emit('updatePrice', productId, Math.max(0, price))
}
</script>

<template>
  <!-- Selection Sidebar -->
  <div class="h-full w-full flex flex-col border-l border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
    <!-- Header -->
    <div class="flex-shrink-0 border-b border-gray-200 from-blue-50 to-indigo-50 bg-gradient-to-r p-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-700">
      <div class="flex items-center space-x-3">
        <div class="h-8 w-8 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <Icon icon="ri-shopping-cart-line" class="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 class="text-base text-gray-900 font-semibold dark:text-white">
            {{ t('products.selected_products') }}
          </h3>
          <p class="text-xs text-gray-600 dark:text-gray-400">
            {{ t('products.selected_count', { count: products.length }) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="min-h-0 flex flex-1 flex-col overflow-hidden">
      <!-- Selected products cards -->
      <div class="min-h-0 flex-1 overflow-y-auto p-3">
        <div
          v-if="products.length === 0"
          class="h-48 flex flex-col items-center justify-center text-center"
        >
          <div class="mb-3 h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <Icon icon="ri-shopping-cart-line" class="h-6 w-6 text-gray-400" />
          </div>
          <h3 class="mb-1 text-sm text-gray-900 font-medium dark:text-white">
            {{ t('products.no_products_selected') }}
          </h3>
          <p class="max-w-xs text-xs text-gray-500 dark:text-gray-400">
            {{ t('products.add_products_to_see_here') }}
          </p>
        </div>
        <div v-else class="pb-2 space-y-2">
          <div
            v-for="product in selectionTableData"
            :key="product.id"
            class="group relative border border-gray-200 rounded-lg bg-white p-2 shadow-sm transition-all duration-200 dark:border-gray-700 hover:border-blue-300 dark:bg-gray-800 hover:shadow-md dark:hover:border-blue-600"
          >
            <!-- Card Header with Product Info -->
            <div class="mb-2 flex items-start justify-between">
              <div class="min-w-0 flex-1">
                <div class="flex items-start gap-2">
                  <!-- Product Details -->
                  <div class="min-w-0 flex-1">
                    <h4 class="truncate text-sm text-gray-900 font-medium dark:text-white">
                      {{ product.name }}
                    </h4>
                    <!-- Category and Unit Badges -->
                    <div class="mt-1 flex flex-wrap gap-1">
                      <span class="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700 font-medium dark:bg-gray-700 dark:text-gray-300">
                        <Icon icon="ri-folder-line" class="mr-1 h-2 w-2" />
                        {{ product.category }}
                      </span>
                      <span class="inline-flex items-center rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700 font-medium dark:bg-blue-900 dark:text-blue-300">
                        <Icon icon="ri-ruler-line" class="mr-1 h-2 w-2" />
                        {{ product.unit }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Remove Button -->
              <div class="ml-2 flex-shrink-0">
                <MButton
                  icon-button
                  icon="ri-delete-bin-5-line"
                  color="error"
                  class="opacity-70 transition-opacity duration-200 hover:opacity-100"
                  @click="removeFromSelection(Number(product.id))"
                />
              </div>
            </div>

            <!-- Editable Fields Section -->
            <div class="flex gap-2">
              <!-- Quantity Input -->
              <div class="flex-1">
                <MInput
                  :model-value="product.quantity"
                  type="number"
                  min="1"
                  size="sm"
                  class="text-xs"
                  prepend-icon="ri-stack-line"
                  :placeholder="t('products.quantity')"
                  @update:model-value="(value) => updateQuantity(Number(product.id), Number(value))"
                />
              </div>

              <!-- Price Input -->
              <div class="flex-1">
                <MInput
                  :model-value="product.price"
                  type="number"
                  min="0"
                  step="0.01"
                  size="sm"
                  class="text-xs"
                  prepend-icon="ri-price-tag-3-line"
                  :placeholder="t('products.price')"
                  @update:model-value="(value) => updatePrice(Number(product.id), Number(value))"
                />
              </div>
            </div>

            <!-- Hover Effects -->
            <div class="absolute right-2 top-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <div class="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
            </div>
          </div>
        </div>
      </div>

      <!-- Footer with total -->
      <div class="flex-shrink-0 border-t border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
        <div class="flex items-center space-x-2">
          <div class="h-8 w-8 flex items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
            <Icon icon="ri-calculator-line" class="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-base text-gray-900 font-bold dark:text-white">
              {{ formatCurrency(totalAmount) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Enhanced scrollbar styling with better performance */
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

/* Smooth scrolling behavior */
.overflow-y-auto {
  scroll-behavior: smooth;
  overscroll-behavior: contain;
}

/* Performance optimizations for containers */
.min-h-0 {
  contain: layout style paint;
}

/* Card animations with better performance */
.group {
  transform: translateZ(0); /* Force hardware acceleration */
  will-change: transform;
}

.group:hover {
  transform: translateY(-1px) translateZ(0);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced focus states for inputs */
.MInput:focus-within {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  border-color: rgb(59, 130, 246);
  transition: all 0.2s ease;
}

/* Button hover states with hardware acceleration */
.MButton {
  transform: translateZ(0);
  will-change: transform;
}

.MButton:hover {
  transform: translateY(-0.5px) translateZ(0);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Optimize container scroll performance */
.min-h-0 {
  contain: layout style paint;
}

/* Better scroll momentum on mobile */
@media (max-width: 768px) {
  .overflow-y-auto {
    -webkit-overflow-scrolling: touch;
  }
}
</style>
