<script setup lang="ts">
import type { IPaymentType } from '~/types/information'
import { usePaymentTypesStore } from '~/stores/paymentTypes'
import { defaultPaymentType } from '~/types/information'

const paymentTypesStore = usePaymentTypesStore()
const title = ref<string>('paymentTypes.add_payment_type')
const paymentType = ref<IPaymentType>(defaultPaymentType)
const showDialog = ref<boolean>(false)
const loading = ref<boolean>(false)

const { t } = useI18n({
  useScope: 'global',
})

// Currency options for autocomplete
const currencyOptions = computed(() => [
  {
    id: 'UZS',
    label: 'UZS',
    value: 'UZS',
  },
  {
    id: 'USD',
    label: 'USD',
    value: 'USD',
  },
])

function open(currentPaymentType: IPaymentType | null = null) {
  if (currentPaymentType) {
    paymentType.value = currentPaymentType
    title.value = 'paymentTypes.edit_payment_type'
  }
  else {
    paymentType.value = defaultPaymentType
    title.value = 'paymentTypes.add_payment_type'
  }
  showDialog.value = true
}

function handleCancel() {
  showDialog.value = false
}

async function handleSave() {
  loading.value = true
  try {
    if (paymentType.value.id) {
      await paymentTypesStore.updatePaymentType(paymentType.value)
    }
    else {
      await paymentTypesStore.createPaymentType(paymentType.value)
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
        v-model="paymentType.name"
        class="w-100"
        :label="t('paymentTypes.name')"
        :placeholder="t('paymentTypes.enter_name')"
      />
      <MAutocomplete
        v-model="paymentType.currency"
        class="w-100"
        :label="t('paymentTypes.currency')"
        :placeholder="t('paymentTypes.enter_currency')"
        :options="currencyOptions"
        :clearable="false"
        :filterable="false"
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
