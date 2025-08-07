<script setup lang="ts">
import type { IOrganization } from '~/types/information'
import { useOrganizationsStore } from '~/stores/organizations'
import { defaultOrganization } from '~/types/information'

const organizationsStore = useOrganizationsStore()
const title = ref<string>('organizations.add_organization')
const organization = ref<IOrganization>(defaultOrganization)
const showDialog = ref<boolean>(false)
const loading = ref<boolean>(false)

const { t } = useI18n({
  useScope: 'global',
})

function open(currentOrganization: IOrganization | null = null) {
  if (currentOrganization) {
    organization.value = currentOrganization
    title.value = 'organizations.edit_organization'
  }
  else {
    organization.value = defaultOrganization
    title.value = 'organizations.add_organization'
  }
  showDialog.value = true
}

function handleCancel() {
  showDialog.value = false
}

async function handleSave() {
  loading.value = true
  try {
    if (organization.value.id) {
      await organizationsStore.updateOrganization(organization.value)
    }
    else {
      await organizationsStore.createOrganization(organization.value)
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
      v-model="organization.name"
      class="w-100"
      :label="t('organizations.name')"
      :placeholder="t('organizations.enter_name')"
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
