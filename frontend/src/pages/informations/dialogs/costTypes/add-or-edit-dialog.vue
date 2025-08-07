<script setup lang="ts">
import type { ICostType } from '~/types/information'
import { useCostTypesStore } from '~/stores/costTypes'
import { defaultCostType } from '~/types/information'

const costTypesStore = useCostTypesStore()
const title = ref<string>('costTypes.add_cost_type')
const costType = ref<ICostType>(defaultCostType)
const showDialog = ref<boolean>(false)
const loading = ref<boolean>(false)

const { t } = useI18n({
  useScope: 'global',
})

function open(currentCostType: ICostType | null = null) {
  if (currentCostType) {
    costType.value = currentCostType
    title.value = 'costTypes.edit_cost_type'
  }
  else {
    costType.value = defaultCostType
    title.value = 'costTypes.add_cost_type'
  }
  showDialog.value = true
}

function handleCancel() {
  showDialog.value = false
}

async function handleSave() {
  loading.value = true
  try {
    if (costType.value.id) {
      await costTypesStore.updateCostType(costType.value)
    }
    else {
      await costTypesStore.createCostType(costType.value)
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
    <MInput
      v-model="costType.name"
      class="w-100"
      :label="t('costTypes.name')"
      :placeholder="t('costTypes.enter_name')"
    />
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
