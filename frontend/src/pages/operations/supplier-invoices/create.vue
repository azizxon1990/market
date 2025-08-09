<script setup lang="ts">
import type { ICategory, IInvoice, IInvoiceItem, IProduct } from '~/types/information'
import { Icon } from '@iconify/vue'
import { computed, ref } from 'vue'
import { useFormatting } from '~/composables/useFormatting'
import PickProductsDialog from './dialogs/pick-products.vue'

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
const loading = ref(false)
const showPickDialog = ref(false)
const productsColumns = [
  { key: 'product.id', label: 'table.columns.id', translatable: true, width: '80px' },
  { key: 'product.name', label: 'table.columns.product', translatable: true },
  { key: 'product.name', label: 'table.columns.name', translatable: true, width: '200px' },
  { key: 'quantity', label: 'table.columns.quantity', translatable: true, width: '200px' },
  { key: 'price', label: 'table.columns.price', translatable: true, width: '200px' },
  { key: 'total', label: 'table.columns.total_amount', translatable: true, width: '200px' },
  { key: 'actions', label: 'table.columns.actions', translatable: true, width: '100px' },
]

const newInvoice = ref<IInvoice>({
  supplier_id: 0,
  warehouse_id: 0,
  products: [],
})

const suppliers = computed(() => suppliersStore.activeSuppliers)
const warehouses = computed(() => warehousesStore.activeWarehouses)
const router = useRouter()

onMounted(async () => {
  await suppliersStore.fetchActiveSuppliers()
  await warehousesStore.fetchActiveWarehousesByOrganization()
  if (suppliersStore.activeSuppliers?.length === 1) {
    newInvoice.value.supplier_id = suppliersStore.activeSuppliers[0].id
  }
  if (warehousesStore.activeWarehouses?.length === 1) {
    newInvoice.value.warehouse_id = warehousesStore.activeWarehouses[0].id
  }
})

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

  newInvoice.value.products = invoiceItems
  showPickDialog.value = false
}

async function saveInvoice() {
  loading.value = true
  try {
    await invoicesStore.createInvoice(newInvoice.value)
    router.push('/operations/supplier-invoices/input')
  }
  finally {
    loading.value = false
  }
}

function updateQuantity(index: number, quantity: number) {
  if (newInvoice.value.products && newInvoice.value.products[index]) {
    if (quantity <= 0) {
      // Remove product if quantity is 0 or negative
      newInvoice.value.products.splice(index, 1)
    }
    else {
      newInvoice.value.products[index].quantity = quantity
    }
  }
}

function updatePrice(index: number, price: number) {
  if (newInvoice.value.products && newInvoice.value.products[index]) {
    newInvoice.value.products[index].price = Math.max(0, price)
  }
}

function getProductIndex(row: any): number {
  return newInvoice.value.products?.findIndex(product =>
    product.product_id === row.product_id
    || (product.product && product.product.id === row.id),
  ) || 0
}

function pickProducts() {
  const products: ProductWithQuantity[] = newInvoice.value.products.map((product: IInvoiceItem) => {
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
</script>

<template>
  <MainPage class="overflow-hidden !rounded-lg">
    <div class="h-full w-full bg-white">
      <div class="flex flex-col gap-4 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <MButton
              icon-button icon="ri-arrow-left-line" color="transparent"
              @click="$router.push('/operations/supplier-invoices/input')"
            />
            <h1 class="text-2xl text-gray-900 font-bold dark:text-white">
              {{ $t('invoices.create_supplier_invoice') }}
            </h1>
          </div>
          <MButton
            variant="primary" :loading="loading"
            :disabled="loading || !newInvoice.supplier_id || !newInvoice.warehouse_id || newInvoice.products?.length === 0 || !newInvoice.products.every(p => p.quantity > 0 && p.price > 0)"
            prepend-icon="ri-check-line" @click="saveInvoice"
          >
            {{ $t('button.save') }}
          </MButton>
        </div>
        <div class="flex items-center justify-between gap-4">
          <!-- Form fields go here -->
          <MAutocomplete
            v-model="newInvoice.supplier_id" :items="suppliers" item-value="id" item-text="name"
            :placeholder="$t('invoices.select_supplier')" class="w-full"
          />
          <MAutocomplete
            v-model="newInvoice.warehouse_id" :items="warehouses" item-value="id" item-text="name"
            :placeholder="$t('invoices.select_warehouse')" class="w-full"
          />
          <MButton color="tertiary" prepend-icon="ri-add-line" @click="pickProducts">
            {{ $t('invoices.add_products') }}
          </MButton>
        </div>
        <PickProductsDialog ref="pickDialogRef" @save="handleProductsPicked" @close="showPickDialog = false" />
        <MDataTable :data="newInvoice.products || []" :columns="productsColumns">
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
                  {{ row.category?.name || '' }}
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
              {{ formatCurrency(row.quantity * row.price) }}
            </span>
          </template>
          <template #actions="{ row }">
            <MButton
              variant="text" color="error" icon-button icon="ri-delete-bin-5-line"
              @click="newInvoice.products.splice(getProductIndex(row), 1)"
            />
          </template>
        </MDataTable>
      </div>
    </div>
  </MainPage>
</template>
