<script setup lang="ts">
import type { IProduct } from '~/types/information'
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useFormatting } from '~/composables/useFormatting'

interface ProductWithQuantity extends IProduct {
    quantity: number
    price: number
}

const props = defineProps<{
    products: ProductWithQuantity[]
}>()

const emit = defineEmits<{
    'remove-product': [productId: number]
    'update-quantity': [productId: number, quantity: number]
    'update-price': [productId: number, price: number]
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
    emit('remove-product', productId)
}

function updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
        emit('remove-product', productId)
    } else {
        emit('update-quantity', productId, quantity)
    }
}

function updatePrice(productId: number, price: number) {
    emit('update-price', productId, Math.max(0, price))
}
</script>

<template>
    <!-- Selection Sidebar -->
    <div class="flex w-full h-full flex-col bg-white shadow-xl dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
        <!-- Header -->
        <div class="flex-shrink-0 border-b border-gray-200 p-4 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
            <div class="flex items-center space-x-3">
                <div class="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Icon icon="ri-shopping-cart-line" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                        {{ t('products.selected_products') }}
                    </h3>
                    <p class="text-xs text-gray-600 dark:text-gray-400">
                        {{ t('products.selected_count', { count: products.length }) }}
                    </p>
                </div>
            </div>
        </div>

        <!-- Content -->
        <div class="flex flex-1 flex-col overflow-hidden">
            <!-- Selected products cards -->
            <div class="flex-1 overflow-auto p-3">
                <div v-if="products.length === 0" 
                     class="flex flex-col items-center justify-center h-48 text-center">
                    <div class="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                        <Icon icon="ri-shopping-cart-line" class="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {{ t('products.no_products_selected') }}
                    </h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                        {{ t('products.add_products_to_see_here') }}
                    </p>
                </div>
                <div v-else class="space-y-2">
                    <div 
                        v-for="product in selectionTableData" 
                        :key="product.id"
                        class="group relative rounded-lg border border-gray-200 bg-white p-2 shadow-sm transition-all duration-200 hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600"
                    >
                        <!-- Card Header with Product Info -->
                        <div class="flex items-start justify-between mb-2">
                            <div class="flex-1 min-w-0">
                                <div class="flex items-start gap-2">

                                    
                                    <!-- Product Details -->
                                    <div class="flex-1 min-w-0">
                                        <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {{ product.name }}
                                        </h4>
                                        <!-- Category and Unit Badges -->
                                        <div class="flex flex-wrap gap-1 mt-1">
                                            <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                <Icon icon="ri-folder-line" class="w-2 h-2 mr-1" />
                                                {{ product.category }}
                                            </span>
                                            <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                                <Icon icon="ri-ruler-line" class="w-2 h-2 mr-1" />
                                                {{ product.unit }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Remove Button -->
                            <div class="flex-shrink-0 ml-2">
                                <MButton
                                    icon-button
                                    icon="ri-close-line"
                                    color="secondary"
                                    class="opacity-70 hover:opacity-100 transition-opacity duration-200"
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
                        <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer with total -->
            <div class="flex-shrink-0 border-t border-gray-200 p-3 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div class="flex items-center space-x-2">
                    <div class="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Icon icon="ri-calculator-line" class="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <p class="text-base font-bold text-gray-900 dark:text-white">
                            {{ formatCurrency(totalAmount) }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Custom scrollbar styling */
.overflow-auto::-webkit-scrollbar {
    width: 4px;
}

.overflow-auto::-webkit-scrollbar-track {
    background: transparent;
}

.overflow-auto::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.5);
    border-radius: 2px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
    background: rgba(156, 163, 175, 0.7);
}

/* Card animations */
.group:hover {
    transform: translateY(-1px);
}

/* Focus states for inputs */
.MInput:focus-within {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    border-color: rgb(59, 130, 246);
}

/* Enhance button hover states */
.MButton:hover {
    transform: translateY(-0.5px);
    transition: all 0.2s ease;
}
</style>
