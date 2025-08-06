<script setup lang="ts">
import type { ICategory } from '~/types/information'
import { defaultCategory } from '~/types/information'

const categoriesStore = useCategoriesStore()
const title = ref<string>('')
const category = ref<ICategory>(defaultCategory)
const showDialog = ref<boolean>(false)
const loading = ref<boolean>(false)

const { t } = useI18n({
  useScope: 'global',
})

function open(currenCategory: ICategory | null = null) {
  if (currenCategory) {
    category.value = currenCategory
    title.value = 'categories.edit_category'
  }
  else {
    category.value = defaultCategory
    title.value = 'categories.add_category'
  }
  showDialog.value = true
}

function handleCancel() {
  showDialog.value = false
}

async function handleSave() {
  loading.value = true
  try {
    if (category.value.id) {
      await categoriesStore.updateCategory(category.value)
    }
    else {
      await categoriesStore.createCategory(category.value)
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
      v-model="category.name"
      class="w-100"
      :label="t('categories.name')"
      :placeholder="t('categories.enter_name')"
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
