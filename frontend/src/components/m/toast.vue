<script setup lang="ts">
import type { Toast } from '~/composables/toast'
import { Icon } from '@iconify/vue'

interface Props {
  toast: Toast
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: [id: string]
}>()

// Toast type configurations
const toastConfig = {
  success: {
    icon: 'mdi:check-circle',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    iconColor: 'text-green-500 dark:text-green-400',
    titleColor: 'text-green-800 dark:text-green-200',
    messageColor: 'text-green-600 dark:text-green-300',
  },
  error: {
    icon: 'mdi:alert-circle',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-500 dark:text-red-400',
    titleColor: 'text-red-800 dark:text-red-200',
    messageColor: 'text-red-600 dark:text-red-300',
  },
  warning: {
    icon: 'mdi:alert',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    iconColor: 'text-yellow-500 dark:text-yellow-400',
    titleColor: 'text-yellow-800 dark:text-yellow-200',
    messageColor: 'text-yellow-600 dark:text-yellow-300',
  },
  info: {
    icon: 'mdi:information',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-500 dark:text-blue-400',
    titleColor: 'text-blue-800 dark:text-blue-200',
    messageColor: 'text-blue-600 dark:text-blue-300',
  },
}

const config = computed(() => toastConfig[props.toast.type])

const toastClasses = computed(() => {
  return `${config.value.bgColor} ${config.value.borderColor} border rounded-lg shadow-lg p-4 mb-3 transform transition-all duration-300 ease-in-out`
})

function handleClose() {
  emit('close', props.toast.id)
}
</script>

<template>
  <div :class="toastClasses" role="alert">
    <div class="flex items-start">
      <!-- Icon -->
      <div class="flex-shrink-0">
        <Icon
          :icon="config.icon"
          :class="config.iconColor"
          class="mt-0.5 h-5 w-5"
        />
      </div>

      <!-- Content -->
      <div class="ml-3 min-w-0 flex-1">
        <h4 :class="config.titleColor" class="text-sm font-medium">
          {{ toast.title }}
        </h4>
        <p
          v-if="toast.message"
          :class="config.messageColor"
          class="mt-1 text-sm"
        >
          {{ toast.message }}
        </p>
      </div>

      <!-- Close button -->
      <div class="ml-4 flex-shrink-0">
        <button
          type="button"
          class="inline-flex rounded-md text-gray-400 outline-none ring-offset-2 ring-blue-500 dark:text-gray-500 hover:text-gray-500 focus:ring-2 dark:hover:text-gray-400"
          @click="handleClose"
        >
          <span class="sr-only">Close</span>
          <Icon icon="mdi:close" class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</template>
