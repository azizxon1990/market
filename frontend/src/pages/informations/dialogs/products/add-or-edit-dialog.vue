<script setup lang="ts">
import type { ICategory, IProduct } from '~/types/information'
import { computed, ref } from 'vue'
import MAutocomplete from '~/components/m/autocomplete.vue'
import { defaultProduct } from '~/types/information'

const emit = defineEmits<{
  saved: []
}>()

const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()
const title = ref<string>('products.add_product')
const product = ref<IProduct>(defaultProduct)
const showDialog = ref<boolean>(false)
const loading = ref<boolean>(false)
const categories = ref<ICategory[]>([])

const { t } = useI18n({
  useScope: 'global',
})

// Computed category options for autocomplete
const categoryOptions = computed(() => {
  return categories.value.map(category => ({
    id: category.id,
    label: category.name,
    value: category.id,
  }))
})

async function loadCategories() {
  try {
    const result = await categoriesStore.fetchCategories({ status: 'active', limit: 1000 })
    categories.value = result?.categories || []
  }
  catch (error) {
    console.error('Error loading categories:', error)
  }
}

function open(currentProduct: IProduct | null = null) {
  if (currentProduct) {
    product.value = { ...currentProduct }
    title.value = 'products.edit_product'
  }
  else {
    product.value = { ...defaultProduct }
    title.value = 'products.add_product'
  }
  showDialog.value = true
  loadCategories()
}

function handleCancel() {
  showDialog.value = false
}

async function handleSave() {
  if (!product.value.name?.trim()) {
    return
  }

  if (!product.value.category_id) {
    return
  }

  if (!product.value.unit?.trim()) {
    return
  }

  loading.value = true
  try {
    const productData = {
      ...product.value,
      name: product.value.name.trim(),
      unit: product.value.unit.trim(),
      description: product.value.description?.trim() || '',
    }

    if (product.value.id) {
      await productsStore.updateProduct(productData)
    }
    else {
      await productsStore.createProduct(productData)
    }
    showDialog.value = false
    emit('saved')
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
        v-model="product.name"
        class="w-100"
        :label="t('products.name')"
        :placeholder="t('products.name_placeholder')"
        required
      />

      <div>
        <label class="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-300">
          {{ t('products.category') }}
          <span class="text-red-500">*</span>
        </label>
        <MAutocomplete
          v-model="product.category_id"
          :options="categoryOptions"
          :placeholder="t('products.select_category')"
          size="md"
          :clearable="false"
          prepend-icon="ri-folder-line"
          class="w-full"
        />
      </div>

      <MInput
        v-model="product.unit"
        class="w-full"
        :label="t('products.unit')"
        :placeholder="t('products.unit_placeholder')"
        required
      />

      <MTextarea
        v-model="product.description"
        class="w-full"
        :label="t('products.product_description')"
        :placeholder="t('products.description_placeholder')"
        :rows="3"
      />

      <div class="flex items-center space-x-2">
        <MSwitch v-model="product.active" />
        <label class="text-sm text-gray-700 dark:text-gray-300">
          {{ t('table.columns.active') }}
        </label>
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
