<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { error } from 'node_modules/cypress/types/jquery'

interface Props {
  color?: 'primary' | 'secondary' | 'tertiary' | 'transparent' | 'error'
  loading?: boolean
  prependIcon?: string
  appendIcon?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  iconButton?: boolean
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  loading: false,
  disabled: false,
  type: 'button',
  iconButton: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  const baseClasses = props.iconButton
    ? 'flex items-center justify-center p-2 rounded-md font-medium transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
    : 'flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap'

  const colorClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
    tertiary: 'bg-transparent text-blue-500 border border-blue-500 hover:bg-blue-50 focus:ring-blue-500 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20',
    transparent: 'bg-transparent text-gray-900 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-100 dark:hover:bg-gray-800',
    error: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
  }

  return `${baseClasses} ${colorClasses[props.color]}`
})

const isDisabled = computed(() => props.disabled || props.loading)

function handleClick(event: MouseEvent) {
  if (!isDisabled.value) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :class="buttonClasses"
    :disabled="isDisabled"
    :type="type"
    @click="handleClick"
  >
    <!-- Icon Button Mode - Only show the main icon -->
    <template v-if="iconButton">
      <!-- Loading Icon for Icon Button -->
      <Icon
        v-if="loading"
        icon="ri-loader-2-line"
        class="h-5 w-5 animate-spin"
      />
      <!-- Main Icon for Icon Button -->
      <Icon
        v-else-if="icon"
        :icon="icon"
        class="h-5 w-5"
      />
    </template>

    <!-- Regular Button Mode -->
    <template v-else>
      <!-- Prepend Icon -->
      <Icon
        v-if="prependIcon && !loading"
        :icon="prependIcon"
        class="h-5 w-5"
      />

      <!-- Loading Icon -->
      <Icon
        v-if="loading"
        icon="ri-loader-2-line"
        class="h-5 w-5 animate-spin"
      />

      <!-- Default Slot Content -->
      <slot />

      <!-- Append Icon -->
      <Icon
        v-if="appendIcon && !loading"
        :icon="appendIcon"
        class="h-5 w-5"
      />
    </template>
  </button>
</template>
