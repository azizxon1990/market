<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useFormatting } from '~/composables/useFormatting'
import { useInvoicesStore } from '~/stores/invoices'
import { DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'

defineOptions({
  name: 'SupplierInputInvoicesPage',
})

const router = useRouter()
const { formatCurrency } = useFormatting()

const invoicesStore = useInvoicesStore()

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
  { key: 'supplier.name', label: 'table.columns.supplier', translatable: true },
  { key: 'warehouse.name', label: 'table.columns.warehouse', translatable: true },
  { key: 'total_amount', label: 'table.columns.total_amount', width: '120px', translatable: true },
  { key: 'description', label: 'table.columns.description', translatable: true },
  { key: 'actions', label: 'table.columns.actions', width: '150px', translatable: true },
])

const invoices = computed(() => invoicesStore.invoices)
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

function onPageChange(page: number) {
  currentPage.value = page
  fetchInvoices()
}

function onSearch() {
  currentPage.value = 1
  fetchInvoices()
}

function createNewInvoice() {
  // Navigate to create invoice page
  router.push('/operations/supplier-invoices/create')
}

function editInvoice(invoiceId: string | number | undefined) {
  if (!invoiceId)
    return
  // Navigate to edit invoice page
  router.push(`/operations/supplier-invoices/update/${invoiceId}`)
}

async function deleteInvoice(invoiceId: string | number | undefined) {
  if (!invoiceId)
    return

  // eslint-disable-next-line no-alert
  if (confirm('Are you sure you want to delete this invoice?')) {
    try {
      const success = await invoicesStore.deleteInvoice(Number(invoiceId))
      if (success) {
        // Refresh the list
        await fetchInvoices()
      }
    }
    catch (error) {
      console.error('Error deleting invoice:', error)
    }
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchInvoices(),
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
    <div class="flex items-center justify-between gap-2">
      <MInput
        v-model="searchQuery"
        prepend-icon="ri-search-line"
        :placeholder="$t('invoices.search_placeholder')"
        type="text"
        class="w-full"
        @keyup.enter="onSearch"
      />
      <MButton
        variant="primary"
        prepend-icon="ri-add-line"
        @click="createNewInvoice"
      >
        {{ $t('invoices.create_new_invoice') }}
      </MButton>
    </div>

    <!-- Data Table -->
    <MDataTable
      :columns="columns"
      :data="(invoices as any)"
      :pagination="paginationData"
      :loading="loading"
      @page-change="onPageChange"
    >
      <template #total_amount="{ row }">
        <span class="text-gray-900 font-medium dark:text-white">
          {{ formatCurrency(row.total_amount || 0) }}
        </span>
      </template>
      <template #actions="{ row }">
        <div class="flex items-center gap-1">
          <MButton
            variant="text" color="primary" icon-button icon="ri-edit-line"
            :title="$t('button.edit')"
            @click="editInvoice(row.id)"
          />
          <MButton
            variant="text" color="error" icon-button icon="ri-delete-bin-5-line"
            :title="$t('button.delete')"
            @click="deleteInvoice(row.id)"
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
