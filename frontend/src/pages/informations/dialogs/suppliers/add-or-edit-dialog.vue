<script setup lang="ts">
import type { ISupplier } from '~/types/information'
import { useSuppliersStore } from '~/stores/suppliers'
import { defaultSupplier } from '~/types/information'

const suppliersStore = useSuppliersStore()
const title = ref<string>('suppliers.add_supplier')
const supplier = ref<ISupplier>(defaultSupplier)
const showDialog = ref<boolean>(false)
const loading = ref<boolean>(false)

const { t } = useI18n({
  useScope: 'global',
})

function open(currentSupplier: ISupplier | null = null) {
  if (currentSupplier) {
    supplier.value = currentSupplier
    title.value = 'suppliers.edit_supplier'
  }
  else {
    supplier.value = defaultSupplier
    title.value = 'suppliers.add_supplier'
  }
  showDialog.value = true
}

function handleCancel() {
  showDialog.value = false
}

async function handleSave() {
  loading.value = true
  try {
    if (supplier.value.id) {
      await suppliersStore.updateSupplier(supplier.value)
    }
    else {
      await suppliersStore.createSupplier(supplier.value)
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
        v-model="supplier.name"
        class="w-100"
        :label="t('suppliers.name')"
        :placeholder="t('suppliers.enter_name')"
      />
      <MInput
        v-model="supplier.phone_number"
        class="w-100"
        :label="t('suppliers.phone')"
        :placeholder="t('suppliers.enter_phone')"
      />
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
