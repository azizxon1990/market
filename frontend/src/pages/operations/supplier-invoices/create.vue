<script setup lang="ts">
import type { IInvoice } from '~/types/information'
import { computed, ref } from 'vue'
import PickProductsDialog from './dialogs/pick-products.vue'
import { useFormatting } from '~/composables/useFormatting'

interface ProductWithQuantity {
  id: number
  name: string
  category_id: number
  unit: string
  quantity: number
  price: number
  total?: number
}

const suppliersStore = useSuppliersStore()
const warehousesStore = useWarehousesStore()
const invoicesStore = useInvoicesStore()
const { formatCurrency } = useFormatting()
const loading = ref(false)
const showPickDialog = ref(false)
const productsColumns = [
  { key: 'product.id', label: 'table.columns.id', translatable: true },
  { key: 'product.name', label: 'table.columns.name', translatable: true },
  { key: 'quantity', label: 'table.columns.quantity', translatable: true },
  { key: 'price', label: 'table.columns.price', translatable: true },
  { key: 'total', label: 'table.columns.total_amount', translatable: true },
]

const newInvoice = ref<IInvoice>({
  supplier_id: 0,
  warehouse_id: 0,
  products: [],
})

const suppliers = computed(() => suppliersStore.activeSuppliers)
const warehouses = computed(() => warehousesStore.activeWarehouses)
const router = useRouter()

onMounted(() => {
  suppliersStore.fetchActiveSuppliers()
  warehousesStore.fetchActiveWarehousesByOrganization()
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
  }))
  console.log(products);
  
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
    } else {
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
    product.product_id === row.product_id ||
    (product.product && product.product.id === row.id)
  ) || 0
}
</script>

<template>
  <MainPage class="overflow-hidden !rounded-lg">
    <div class="h-full w-full bg-white">
      <div class="flex flex-col gap-4 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <MButton icon-button icon="ri-arrow-left-line" color="transparent"
              @click="$router.push('/operations/supplier-invoices/input')" />
            <h1 class="text-2xl text-gray-900 font-bold dark:text-white">
              {{ $t('invoices.create_supplier_invoice') }}
            </h1>
          </div>
          <MButton variant="primary" :loading="loading"
            :disabled="loading || !newInvoice.supplier_id || !newInvoice.warehouse_id || newInvoice.products?.length === 0"
            prepend-icon="ri-check-line" @click="saveInvoice">
            {{ $t('button.save') }}
          </MButton>
        </div>
        <div class="flex items-center justify-between gap-4">
          <!-- Form fields go here -->
          <MAutocomplete v-model="newInvoice.supplier_id" :items="suppliers" item-value="id" item-text="name"
            :placeholder="$t('invoices.select_supplier')" class="w-full" />
          <MAutocomplete v-model="newInvoice.warehouse_id" :items="warehouses" item-value="id" item-text="name"
            :placeholder="$t('invoices.select_warehouse')" class="w-full" />
          <MButton color="tertiary" prepend-icon="ri-add-line" @click="showPickDialog = true">
            {{ $t('invoices.add_products') }}
          </MButton>
        </div>
        <PickProductsDialog v-model="showPickDialog" @save="handleProductsPicked" @close="showPickDialog = false" />
        <MDataTable :data="newInvoice.products || []" :columns="productsColumns">
          <template #product_name="{ row }">
           <span>{{row}}</span>
          </template>
          <template #quantity="{ row }">
            <MInput :model-value="row.quantity" type="number" min="1" size="sm" class="w-20"
              @update:model-value="(value) => updateQuantity(getProductIndex(row), Number(value))" />
          </template>
          <template #price="{ row }">
            <MInput :model-value="row.price" type="number" min="0" step="0.01" size="sm" class="w-24"
              @update:model-value="(value) => updatePrice(getProductIndex(row), Number(value))" />
          </template>
          <template #total="{ row }">
            <span class="font-semibold">
              {{ formatCurrency(row.quantity * row.price) }}
            </span>
          </template>
        </MDataTable>
      </div>
    </div>
  </MainPage>
</template>
