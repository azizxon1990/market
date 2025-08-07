<script setup lang="ts">
import type { IOrganization, IWarehouse } from '~/types/information'
import { useOrganizationsStore } from '~/stores/organizations'
import { useWarehousesStore } from '~/stores/warehouses'
import { defaultWarehouse } from '~/types/information'

const warehousesStore = useWarehousesStore()
const organizationsStore = useOrganizationsStore()
const title = ref<string>('warehouses.add_warehouse')
const warehouse = ref<IWarehouse>(defaultWarehouse)
const showDialog = ref<boolean>(false)
const loading = ref<boolean>(false)
const organizations = ref<IOrganization[]>([])

const { t } = useI18n({
  useScope: 'global',
})

const organizationOptions = computed(() =>
  organizations.value.map(org => ({
    id: org.id,
    value: org.id,
    label: org.name,
  })),
)

async function loadOrganizations() {
  try {
    organizations.value = await organizationsStore.fetchActiveOrganizations()
  }
  catch (error) {
    console.error('Error loading organizations:', error)
  }
}

function open(currentWarehouse: IWarehouse | null = null) {
  if (currentWarehouse) {
    warehouse.value = currentWarehouse
    title.value = 'warehouses.edit_warehouse'
  }
  else {
    warehouse.value = defaultWarehouse
    title.value = 'warehouses.add_warehouse'
  }
  loadOrganizations()
  showDialog.value = true
}

function handleCancel() {
  showDialog.value = false
}

async function handleSave() {
  loading.value = true
  try {
    if (warehouse.value.id) {
      await warehousesStore.updateWarehouse(warehouse.value)
    }
    else {
      await warehousesStore.createWarehouse(warehouse.value)
    }
    showDialog.value = false
  }
  finally {
    loading.value = false
  }
}

defineExpose({
  open,
})
</script>

<template>
  <MDialog
    v-model="showDialog"
    :title="t(title)"
    size="medium"
    :show-footer="true"
  >
    <div class="space-y-4">
      <MInput
        v-model="warehouse.name"
        class="w-100"
        :label="t('warehouses.name')"
        :placeholder="t('warehouses.enter_name')"
      />
      <div>
        <label class="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-300">
          {{ t('warehouses.organization') }}
          <span class="text-red-500">*</span>
        </label>
        <MAutocomplete
          v-model="warehouse.organization_id"
          :options="organizationOptions"
          :placeholder="t('warehouses.select_organization')"
          size="md"
          :clearable="false"
          prepend-icon="ri-building-line"
          class="w-full"
        />
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end space-x-3">
        <MButton
          type="button"
          color="secondary"
          :disabled="loading"
          @click="handleCancel"
        >
          {{ t('button.cancel') }}
        </MButton>
        <MButton
          type="button"
          color="primary"
          :loading="loading"
          @click="handleSave"
        >
          {{ t('button.save') }}
        </MButton>
      </div>
    </template>
  </MDialog>
</template>
