<script setup lang="ts">
import type { ICategory, IInvoice, IInvoiceItem, IProduct } from '~/types/information'
import { Icon } from '@iconify/vue'
import { computed, ref } from 'vue'
import { useFormatting } from '~/composables/useFormatting'
import PickProductsDialog from '../dialogs/pick-products.vue'

interface ProductWithQuantity extends IProduct {
  quantity: number
  price: number
  category?: ICategory
}

const pickDialogRef = ref<InstanceType<typeof PickProductsDialog> | null>(null)
const suppliersStore = useSuppliersStore()
const warehousesStore = useWarehousesStore()
const invoicesStore = useInvoicesStore()
const { formatCurrency } = useFormatting()
const router = useRouter()
const route = useRoute()

const loading = ref(false)
const fetchingInvoice = ref(false)
const showPickDialog = ref(false)
const invoiceId = computed(() => {
  const params = route.params as any
  return Number(params.id)
})

const productsColumns = [
  { key: 'product.id', label: 'table.columns.id', translatable: true, width: '80px' },
  { key: 'product.name', label: 'table.columns.product', translatable: true },
  { key: 'quantity', label: 'table.columns.quantity', translatable: true, width: '200px' },
  { key: 'price', label: 'table.columns.price', translatable: true, width: '200px' },
  { key: 'total', label: 'table.columns.total_amount', translatable: true, width: '200px' },
  { key: 'actions', label: 'table.columns.actions', translatable: true, width: '100px' },
]

const editInvoice = ref<IInvoice>({
  warehouse_id: 0,
  supplier_id: 0,
  products: [],
})

const suppliers = computed(() => suppliersStore.activeSuppliers)
const warehouses = computed(() => warehousesStore.activeWarehouses)

onMounted(async () => {
  // Load suppliers and warehouses
  await Promise.all([
    suppliersStore.fetchActiveSuppliers(),
    warehousesStore.fetchActiveWarehousesByOrganization(),
  ])

  // Fetch the invoice to edit
  await fetchInvoiceData()
})

async function fetchInvoiceData() {
  if (!invoiceId.value) {
    router.push('/operations/supplier-invoices/input')
    return
  }

  fetchingInvoice.value = true
  try {
    const invoice = await invoicesStore.fetchInvoice(invoiceId.value)
    if (invoice) {
      // Transform the fetched invoice to match our form structure
      editInvoice.value = {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        invoice_date: invoice.invoice_date,
        warehouse_id: invoice.warehouse_id,
        supplier_id: invoice.supplier_id,
        other_source_id: invoice.other_source_id,
        description: invoice.description,
        products: (invoice as any).items?.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          discount_percentage: item.discount_percentage || 0,
          discount_amount: item.discount_amount || 0,
          exchange_rate: item.exchange_rate,
          product: item.product,
        })) || [],
      }
    }
    else {
      // Invoice not found, redirect back
      router.push('/operations/supplier-invoices/input')
    }
  }
  catch (error) {
    console.error('Error fetching invoice:', error)
    router.push('/operations/supplier-invoices/input')
  }
  finally {
    fetchingInvoice.value = false
  }
}

function handleProductsPicked(products: ProductWithQuantity[]) {
  const invoiceItems = products.map(product => ({
    product_id: product.id,
    quantity: product.quantity,
    price: product.price,
    product: {
      id: product.id,
      name: product.name,
      category_id: product.category_id,
      unit: product.unit,
      active: true,
    },
    category: product.category,
  }))

  editInvoice.value.products = invoiceItems
  showPickDialog.value = false
}

async function updateInvoice() {
  if (!invoiceId.value)
    return

  loading.value = true
  try {
    const result = await invoicesStore.updateInvoice(invoiceId.value, editInvoice.value)
    if (result) {
      router.push('/operations/supplier-invoices/input')
    }
  }
  finally {
    loading.value = false
  }
}

function updateQuantity(index: number, quantity: number) {
  if (editInvoice.value.products && editInvoice.value.products[index]) {
    if (quantity <= 0) {
      // Remove product if quantity is 0 or negative
      editInvoice.value.products.splice(index, 1)
    }
    else {
      editInvoice.value.products[index].quantity = quantity
    }
  }
}

function updatePrice(index: number, price: number) {
  if (editInvoice.value.products && editInvoice.value.products[index]) {
    editInvoice.value.products[index].price = Math.max(0, price)
  }
}

function getProductIndex(row: any): number {
  return editInvoice.value.products?.findIndex(product =>
    product.product_id === row.product_id
    || (product.product && product.product.id === row.id),
  ) || 0
}

function pickProducts() {
  const products: ProductWithQuantity[] = editInvoice.value.products.map((product: IInvoiceItem) => {
    return {
      id: product.product?.id ?? 0,
      name: product.product?.name ?? '',
      category_id: product.product?.category_id ?? 0,
      unit: product.product?.unit ?? '',
      active: product.product?.active ?? true,
      quantity: product.quantity || 1,
      price: product.price || 0,
      category: (product as any).category ?? product.product?.category,
    }
  })

  pickDialogRef.value?.open(products)
}

// Computed property for save button state
const canSave = computed(() => {
  return !loading.value
    && !fetchingInvoice.value
    && editInvoice.value.warehouse_id
    && (editInvoice.value.supplier_id || editInvoice.value.other_source_id)
    && editInvoice.value.products?.length > 0
    && editInvoice.value.products.every(p => p.quantity > 0 && p.price > 0)
})
</script>

<template>
  <MainPage class="fixed inset-0 z-500000 overflow-hidden !rounded-lg">
    <div class="h-full w-full">
      <!-- Loading state for fetching invoice -->
      <div v-if="fetchingInvoice" class="flex items-center justify-center p-8">
        <div class="flex items-center gap-3">
          <Icon icon="ri-loader-4-line" class="h-6 w-6 animate-spin text-blue-600" />
          <span class="text-gray-600 dark:text-gray-400">{{ $t('common.loading') }}...</span>
        </div>
      </div>

      <!-- Main content -->
      <div v-else class="flex flex-col gap-4 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <MButton
              icon-button icon="ri-arrow-left-line" color="transparent"
              @click="$router.push('/operations/supplier-invoices/input')"
            />
            <div class="flex flex-col">
              <h1 class="text-2xl text-gray-900 font-bold dark:text-white">
                {{ `${$t('invoices.edit_supplier_invoice')} - #${editInvoice.invoice_number || $t('invoices.new_invoice')}` }}
              </h1>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <MButton
              variant="primary" :loading="loading"
              :disabled="!canSave"
              prepend-icon="ri-check-line " @click="updateInvoice"
            >
              {{ $t('button.save') }}
            </MButton>
          </div>
        </div>

        <!-- Form fields -->
        <div class="flex items-center justify-between gap-4">
          <!-- Supplier Selection -->
          <MAutocomplete
            v-model="editInvoice.supplier_id" :items="suppliers" item-value="id" item-text="name"
            :placeholder="$t('invoices.select_supplier')" class="w-full"
            clearable
          />

          <!-- Warehouse Selection -->
          <MAutocomplete
            v-model="editInvoice.warehouse_id" :items="warehouses" item-value="id" item-text="name"
            :placeholder="$t('invoices.select_warehouse')" class="w-full"
          />
          <MInput
            v-model="editInvoice.description"
            :placeholder="$t('invoices.description')"
            class="w-full"
            :rows="2"
          />

          <!-- Add Products Button -->
          <MButton color="tertiary" prepend-icon="ri-add-line" @click="pickProducts">
            {{ $t('invoices.add_products') }}
          </MButton>
        </div>

        <!-- Pick Products Dialog -->
        <PickProductsDialog ref="pickDialogRef" @save="handleProductsPicked" @close="showPickDialog = false" />

        <!-- Products Table -->
        <div class="flex-1 overflow-hidden">
          <MDataTable :data="editInvoice.products || []" :columns="productsColumns" class="h-full">
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
                    {{ row.category?.name || row.product.category.name || '' }}
                  </span>
                  <span class="inline-flex items-center rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700 font-medium dark:bg-blue-900 dark:text-blue-300">
                    <Icon icon="ri-ruler-line" class="mr-1 h-2 w-2" />
                    {{ row.product?.unit || "" }}
                  </span>
                </div>
              </div>
            </template>

            <template #quantity="{ row }">
              <MInput
                :model-value="row.quantity" type="number" min="1" size="sm" class="w-full"
                @update:model-value="(value) => updateQuantity(getProductIndex(row), Number(value))"
              />
            </template>

            <template #price="{ row }">
              <MInput
                :model-value="row.price" type="number" min="0" step="0.01" size="sm" class="w-full"
                @update:model-value="(value) => updatePrice(getProductIndex(row), Number(value))"
              />
            </template>

            <template #total="{ row }">
              <span class="font-semibold">
                {{ formatCurrency((row.quantity * row.price) - (row.discount_amount || 0)) }}
              </span>
            </template>

            <template #actions="{ row }">
              <MButton
                variant="text" color="error" icon-button icon="ri-delete-bin-5-line"
                @click="editInvoice.products.splice(getProductIndex(row), 1)"
              />
            </template>
          </MDataTable>
        </div>

        <!-- Empty state for products -->
        <div v-if="!editInvoice.products?.length" class="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
          <Icon icon="ri-shopping-cart-line" class="mb-2 h-12 w-12" />
          <p class="text-lg font-medium">
            {{ $t('invoices.no_products_added') }}
          </p>
          <p class="text-sm">
            {{ $t('invoices.click_add_products_to_start') }}
          </p>
        </div>
      </div>
    </div>
  </MainPage>
</template>
