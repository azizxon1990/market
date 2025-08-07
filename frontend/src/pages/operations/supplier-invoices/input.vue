<script setup lang="ts">
import type { IInvoice } from '~/types/information'
import { computed, onMounted, ref } from 'vue'
import { useInvoicesStore } from '~/stores/invoices'
import { useSuppliersStore } from '~/stores/suppliers'
import { useWarehousesStore } from '~/stores/warehouses'
import { DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'

defineOptions({
  name: 'SupplierInputInvoicesPage',
})

const { t } = useI18n()
const router = useRouter()

const invoicesStore = useInvoicesStore()
const warehousesStore = useWarehousesStore()
const suppliersStore = useSuppliersStore()

// Reactive data
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(DEFAULT_ITEMS_PER_PAGE)
const selectedWarehouse = ref<number | null>(null)
const selectedSupplier = ref<number | null>(null)
const startDate = ref('')
const endDate = ref('')
const paginationData = ref({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: DEFAULT_ITEMS_PER_PAGE as number,
  startItem: 0,
  endItem: 0,
})

// Table columns configuration
const columns = ref([
  { key: 'id', label: 'table.columns.id', width: '80px', translatable: true },
  { key: 'invoice_number', label: 'table.columns.invoice_number', translatable: true },
  { key: 'invoice_date', label: 'table.columns.date', width: '120px', translatable: true },
  { key: 'supplier', label: 'table.columns.supplier', translatable: true },
  { key: 'warehouse', label: 'table.columns.warehouse', translatable: true },
  { key: 'total_amount', label: 'table.columns.total_amount', width: '120px', translatable: true },
  { key: 'description', label: 'table.columns.description', translatable: true },
  { key: 'actions', label: 'table.columns.actions', width: '150px', translatable: true },
])

const invoices = computed(() => invoicesStore.invoices)
const warehouses = computed(() => warehousesStore.warehouses)
const suppliers = computed(() => suppliersStore.suppliers)
const loading = computed(() => invoicesStore.loading)

// Methods
async function fetchInvoices() {
  try {
    const result = await invoicesStore.fetchInvoices({
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: searchQuery.value || undefined,
      warehouseId: selectedWarehouse.value || undefined,
      supplierId: selectedSupplier.value || undefined,
      startDate: startDate.value || undefined,
      endDate: endDate.value || undefined,
      sortField: 'invoice_date',
      sortDirection: 'DESC',
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
    console.error('Error fetching invoices:', error)
  }
}

async function fetchWarehouses() {
  try {
    await warehousesStore.fetchWarehouses({ status: 'active' })
  }
  catch (error) {
    console.error('Error fetching warehouses:', error)
  }
}

async function fetchSuppliers() {
  try {
    await suppliersStore.fetchSuppliers({ status: 'active' })
  }
  catch (error) {
    console.error('Error fetching suppliers:', error)
  }
}

function onPageChange(page: number) {
  currentPage.value = page
  fetchInvoices()
}

function onSearch() {
  currentPage.value = 1
  fetchInvoices()
}

function onFilterChange() {
  currentPage.value = 1
  fetchInvoices()
}

function clearFilters() {
  searchQuery.value = ''
  selectedWarehouse.value = null
  selectedSupplier.value = null
  startDate.value = ''
  endDate.value = ''
  currentPage.value = 1
  fetchInvoices()
}

function formatDate(dateString: string) {
  try {
    const date = new Date(dateString)
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`
  }
  catch {
    return dateString
  }
}

function formatCurrency(amount: number | string) {
  const numAmount = typeof amount === 'string' ? Number.parseFloat(amount) : amount
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numAmount)
}

function createNewInvoice() {
  // Navigate to create invoice page
  router.push('/operations/supplier-invoices/create')
}

function editInvoice(invoice: IInvoice) {
  // Navigate to edit invoice page
  router.push(`/operations/supplier-invoices/edit/${invoice.id}`)
}

function viewInvoice(invoice: IInvoice) {
  // Navigate to view invoice page
  router.push(`/operations/supplier-invoices/view/${invoice.id}`)
}

async function deleteInvoice(invoice: IInvoice) {

}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchInvoices(),
    fetchWarehouses(),
    fetchSuppliers(),
  ])
})
</script>

<template>
  <MainPage class="h-full text-xs space-y-2 dark:bg-gray-700">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl text-gray-900 font-bold dark:text-white">
        {{ $t('invoices.supplier_input_title') }}
      </h1>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 gap-4 rounded-lg bg-white p-4 shadow lg:grid-cols-6 dark:bg-gray-800">
      <!-- Search -->
      <div class="lg:col-span-2">
        <MInput
          v-model="searchQuery"
          prepend-icon="ri-search-line"
          :placeholder="$t('invoices.search_placeholder')"
          type="text"
          class="w-full"
          @keyup.enter="onSearch"
        />
      </div>

      <!-- Warehouse Filter -->
      <div>
        <MAutocomplete
          v-model="selectedWarehouse"
          :items="warehouses"
          item-text="name"
          item-value="id"
          :placeholder="$t('invoices.select_warehouse')"
          clearable
          @change="onFilterChange"
        />
      </div>

      <!-- Supplier Filter -->
      <div>
        <MAutocomplete
          v-model="selectedSupplier"
          :items="suppliers"
          item-text="name"
          item-value="id"
          :placeholder="$t('invoices.select_supplier')"
          clearable
          @change="onFilterChange"
        />
      </div>

      <!-- Date Range -->
      <div>
        <MInput
          v-model="startDate"
          type="date"
          :placeholder="$t('invoices.start_date')"
          class="w-full"
          @change="onFilterChange"
        />
      </div>

      <div>
        <MInput
          v-model="endDate"
          type="date"
          :placeholder="$t('invoices.end_date')"
          class="w-full"
          @change="onFilterChange"
        />
      </div>
    </div>

    <!-- Action Bar -->
    <div class="flex items-center justify-between gap-4">
      <div class="flex gap-2">
        <MButton
          type="button"
          prepend-icon="ri-add-line"
          color="primary"
          @click="createNewInvoice"
        >
          {{ $t('invoices.create_invoice') }}
        </MButton>

        <MButton
          type="button"
          prepend-icon="ri-filter-off-line"
          color="secondary"
          @click="clearFilters"
        >
          {{ $t('button.clear_filters') }}
        </MButton>
      </div>

      <div class="text-sm text-gray-600 dark:text-gray-400">
        {{ $t('table.showing_results', {
          start: paginationData.startItem,
          end: paginationData.endItem,
          total: paginationData.totalItems,
        }) }}
      </div>
    </div>

    <!-- Data Table -->
    <MDataTable
      :columns="columns"
      :data="(invoices as any)"
      :pagination="paginationData"
      :loading="loading"
      @page-change="onPageChange"
    >
      <template #invoice_number="{ row }">
        <button
          class="text-blue-600 font-medium dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
          @click="viewInvoice(row as IInvoice)"
        >
          {{ row.invoice_number }}
        </button>
      </template>

      <template #invoice_date="{ row }">
        <span>{{ formatDate(row.invoice_date) }}</span>
      </template>

      <template #supplier="{ row }">
        <span>{{ row.supplier?.name || '-' }}</span>
      </template>

      <template #warehouse="{ row }">
        <span>{{ row.warehouse?.name || '-' }}</span>
      </template>

      <template #total_amount="{ row }">
        <span class="text-green-600 font-semibold dark:text-green-400">
          {{ formatCurrency(row.total_amount || 0) }}
        </span>
      </template>

      <template #description="{ row }">
        <span class="max-w-xs truncate" :title="row.description">
          {{ row.description || '-' }}
        </span>
      </template>

      <template #actions="{ row }">
        <div class="flex items-center justify-center gap-2">
          <MButton
            icon-button
            icon="ri-eye-line"
            color="primary"
            size="sm"
            :title="$t('button.view')"
            @click="viewInvoice(row as IInvoice)"
          />
          <MButton
            icon-button
            icon="ri-edit-line"
            color="secondary"
            size="sm"
            :title="$t('button.edit')"
            @click="editInvoice(row as IInvoice)"
          />
          <MButton
            icon-button
            icon="ri-delete-bin-line"
            color="tertiary"
            size="sm"
            :title="$t('button.delete')"
            @click="deleteInvoice(row as IInvoice)"
          />
        </div>
      </template>
    </MDataTable>
  </MainPage>
</template>

<route lang="yaml">
meta:
  published: false
</route>
