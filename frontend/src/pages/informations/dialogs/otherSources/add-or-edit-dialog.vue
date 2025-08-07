<script setup lang="ts">
import type { IOtherSource } from '~/types/information'
import { useOtherSourcesStore } from '~/stores/otherSources'
import { defaultOtherSource } from '~/types/information'

const otherSourcesStore = useOtherSourcesStore()
const title = ref<string>('otherSources.add_other_source')
const otherSource = ref<IOtherSource>(defaultOtherSource)
const showDialog = ref<boolean>(false)
const loading = ref<boolean>(false)

const { t } = useI18n({
  useScope: 'global',
})

function open(currentOtherSource: IOtherSource | null = null) {
  if (currentOtherSource) {
    otherSource.value = currentOtherSource
    title.value = 'otherSources.edit_other_source'
  }
  else {
    otherSource.value = defaultOtherSource
    title.value = 'otherSources.add_other_source'
  }
  showDialog.value = true
}

function handleCancel() {
  showDialog.value = false
}

async function handleSave() {
  loading.value = true
  try {
    if (otherSource.value.id) {
      await otherSourcesStore.updateOtherSource(otherSource.value)
    }
    else {
      await otherSourcesStore.createOtherSource(otherSource.value)
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
      v-model="otherSource.name"
      class="w-100"
      :label="t('otherSources.name')"
      :placeholder="t('otherSources.enter_name')"
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
