<script setup lang="ts">
import type { IPaymentType } from '~/types/information'
import { computed, onMounted, ref } from 'vue'
import { usePaymentTypesStore } from '~/stores/paymentTypes'
import { DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'
import AddOrEditDialog from './dialogs/paymentTypes/add-or-edit-dialog.vue'

defineOptions({
  name: 'PaymentTypesPage',
})

const paymentTypesStore = usePaymentTypesStore()
const dialogRef = ref<InstanceType<typeof AddOrEditDialog> | null>(null)
// Reactive data
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(DEFAULT_ITEMS_PER_PAGE)
const paginationData = ref({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
  startItem: 0,
  endItem: 0,
})

// Table columns configuration
const columns = ref([
  { key: 'id', label: 'table.columns.id', width: '80px', translatable: true },
  { key: 'name', label: 'table.columns.name', translatable: true },
  { key: 'currency', label: 'table.columns.currency', width: '100px', translatable: true },
  { key: 'active', label: 'table.columns.status', width: '100px', translatable: true },
  { key: 'actions', label: 'table.columns.actions', width: '100px', translatable: true },
])

const paymentTypes = computed(() => paymentTypesStore.paymentTypes)

// Methods
async function fetchPaymentTypes() {
  try {
    const result = await paymentTypesStore.fetchPaymentTypes({
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: searchQuery.value || undefined,
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
    console.error('Error fetching payment types:', error)
  }
}

function onPageChange(page: number) {
  currentPage.value = page
  fetchPaymentTypes()
}

function onSearch() {
  currentPage.value = 1
  fetchPaymentTypes()
}

// Dialog methods
function openAddDialog() {
  dialogRef.value?.open()
}

function openEditDialog(paymentType: IPaymentType) {
  dialogRef.value?.open(paymentType)
}

// Lifecycle
onMounted(() => {
  fetchPaymentTypes()
})
</script>

<template>
  <MainPage class="h-full text-xs space-y-2 dark:bg-gray-700">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl text-gray-900 font-bold dark:text-white">
        {{ $t('paymentTypes.title') }}
      </h1>
    </div>

    <!-- Search -->
    <div class="w-full flex items-center justify-between gap-4">
      <MInput
        v-model="searchQuery"
        prepend-icon="ri-search-line"
        :placeholder="$t('paymentTypes.search_placeholder')"
        type="text"
        class="w-full"
        @keyup.enter="onSearch"
      />
      <MButton
        type="button"
        prepend-icon="ri-add-line"
        color="primary"
        @click="openAddDialog"
      >
        {{ $t('paymentTypes.add_payment_type') }}
      </MButton>
    </div>
    <!-- Data Table -->
    <MDataTable
      :columns="columns"
      :data="paymentTypes"
      :pagination="paginationData"
      @page-change="onPageChange"
    >
      <template #currency="{ row }">
        <span>{{ row.currency || '-' }}</span>
      </template>
      <template #active="{ row }">
        <span>{{ row.active ? $t('table.columns.active') : $t('table.columns.inactive') }}</span>
      </template>
      <template #actions="{ row }">
        <div class="flex items-center justify-center gap-2">
          <MButton
            icon-button
            icon="ri-edit-line"
            color="secondary"
            @click="openEditDialog(row as IPaymentType)"
          />
          <MSwitch
            v-model="row.active"
          />
        </div>
      </template>
    </MDataTable>

    <!-- Add/Edit Dialog -->
    <AddOrEditDialog ref="dialogRef" />
  </MainPage>
</template>

<route lang="yaml">
meta:
  published: false
</route>
