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
    'save': [products: ProductWithQuantity[]]
    'update-quantity': [productId: number, quantity: number]
    'update-price': [productId: number, price: number]
}>()

const { t } = useI18n({ useScope: 'global' })
const { formatNumber, formatCurrency, formatQuantity } = useFormatting()
const showDrawer = ref(false)

// Selection drawer data
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

function closeDrawer() {
    showDrawer.value = false
}

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

function handleSave() {
    emit('save', props.products)
    closeDrawer()
}
function openDrawer(){
    showDrawer.value = true
}

defineExpose({
    openDrawer,
    closeDrawer,
})
</script>

<template>
    <!-- Selection Drawer -->
    <Teleport to="body">
        <Transition name="drawer">
            <div v-if="showDrawer" class="fixed inset-0 z-6000000 flex bg-black bg-opacity-50 transition-opacity">
                <!-- Overlay -->
                <div 
                    class="relative inset-0 "
                    @click="closeDrawer"
                />
                
                <!-- Drawer Content -->
                <div class="ml-auto flex h-full w-160 max-w-full">
                    <div class="flex w-full flex-col bg-white shadow-xl dark:bg-gray-800">
                        <!-- Header -->
                        <div class="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                            <div class="flex items-center space-x-3">
                                <div class="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Icon icon="ri-shopping-cart-line" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                                        {{ t('products.selected_products') }}
                                    </h3>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">
                                        {{ t('products.selected_count', { count: products.length }) }}
                                    </p>
                                </div>
                            </div>
                            <MButton
                                icon-button
                                icon="ri-close-line"
                                color="secondary"
                                @click="closeDrawer"
                                class="hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                            />
                        </div>

                        <!-- Content -->
                        <div class="flex flex-1 flex-col overflow-hidden">
                            <!-- Selected products cards -->
                            <div class="flex-1 overflow-auto p-4">
                                <!--  -->
                                <div v-if="products.length === 0" 
                                     class="flex flex-col items-center justify-center h-64 text-center">
                                    <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                        <Icon icon="ri-shopping-cart-line" class="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        {{ t('products.no_products_selected') }}
                                    </h3>
                                    <p class="text-gray-500 dark:text-gray-400 max-w-sm">
                                        Add some products to your selection to see them here
                                    </p>
                                </div>
                                <div v-else class="space-y-4">
                                    <div 
                                        v-for="product in selectionTableData" 
                                        :key="product.id"
                                        class="group relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600"
                                    >
                                        <!-- Card Header with Product Info -->
                                        <div class="flex items-start justify-between mb-4">
                                            <div class="flex-1 min-w-0">
                                                <div class="flex items-start gap-3">
                                                    <!-- Product Icon/Avatar -->
                                                    <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                                        <Icon icon="ri-box-3-line" class="w-5 h-5 text-white" />
                                                    </div>
                                                    
                                                    <!-- Product Details -->
                                                    <div class="flex-1 min-w-0">
                                                        <h4 class="text-base font-semibold text-gray-900 dark:text-white truncate">
                                                            {{ product.name }}
                                                        </h4>
                                                        <!-- Category and Unit Badges -->
                                                        <div class="flex flex-wrap gap-2">
                                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                                <Icon icon="ri-folder-line" class="w-3 h-3 mr-1" />
                                                                {{ product.category }}
                                                            </span>
                                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                                <Icon icon="ri-ruler-line" class="w-3 h-3 mr-1" />
                                                                {{ product.unit }}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <!-- Remove Button - Enhanced -->
                                            <div class="flex-shrink-0 ml-4">
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
                                        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 mb-2">
                                            <div class="grid grid-cols-2 gap-4">
                                                <!-- Quantity Input -->
                                                <div class="space-y-2">
                                                    <label class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        <Icon icon="ri-stack-line" class="w-4 h-4 mr-2 text-gray-500" />
                                                        {{ t('products.quantity') }}
                                                    </label>
                                                    <div class="relative">
                                                        <MInput
                                                            :model-value="product.quantity"
                                                            type="number"
                                                            min="1"
                                                            size="sm"
                                                            :placeholder="formatQuantity(product.quantity)"
                                                            @update:model-value="(value) => updateQuantity(Number(product.id), Number(value))"
                                                        />
                                                    </div>
                                                </div>

                                                <!-- Price Input -->
                                                <div class="space-y-2">
                                                    <label class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        <Icon icon="ri-price-tag-3-line" class="w-4 h-4 mr-2 text-gray-500" />
                                                        {{ t('products.price') }}
                                                    </label>
                                                        <MInput
                                                            :model-value="product.price"
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            size="sm"
                                                            :placeholder="formatNumber(product.price)"
                                                            @update:model-value="(value) => updatePrice(Number(product.id), Number(value))"
                                                        />
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Total Section - Enhanced -->
                                        <div class="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                            <div class="flex items-center space-x-2">
                                                <Icon icon="ri-calculator-line" class="w-5 h-5 text-gray-500" />
<div class="text-lg font-bold text-gray-900 dark:text-white">
                                                    {{ formatCurrency(product.total) }}
                                                </div>
                                            </div>
                                            
                                        </div>

                                        <!-- Hover Effects and Status Indicators -->
                                        <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Footer with total and save button -->
                            <div class="border-t border-gray-200 p-6 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center space-x-3">
                                        <div class="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                            <Icon icon="ri-calculator-line" class="w-5 h-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p class="text-2xl font-bold text-gray-900 dark:text-white">
                                                {{ formatCurrency(totalAmount) }}
                                            </p>
                                        </div>
                                    </div>
                                    <div class="flex justify-end gap-3">
                                    <MButton 
                                        color="primary" 
                                        :disabled="products.length === 0"
                                        @click="handleSave"
                                        class="px-6"
                                        prepend-icon="ri-check-line"
                                    >
                                        {{ t('button.save') }}
                                    </MButton>
                                </div>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
    transition: all 0.3s ease;
}

.drawer-enter-from .ml-auto > div,
.drawer-leave-to .ml-auto > div {
    transform: translateX(100%);
}

.drawer-enter-from,
.drawer-leave-to {
    opacity: 0;
}

/* Custom scrollbar styling */
.overflow-auto::-webkit-scrollbar {
    width: 6px;
}

.overflow-auto::-webkit-scrollbar-track {
    background: transparent;
}

.overflow-auto::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
    background: rgba(156, 163, 175, 0.7);
}

/* Card animations */
.group:hover {
    transform: translateY(-1px);
}

/* Line clamp utility for description */
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Focus states for inputs */
.MInput:focus-within {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    border-color: rgb(59, 130, 246);
}

/* Enhance button hover states */
.MButton:hover {
    transform: translateY(-1px);
    transition: all 0.2s ease;
}
</style>
