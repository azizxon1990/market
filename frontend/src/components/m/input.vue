<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed, ref } from 'vue'

interface Props {
  label?: string
  modelValue?: string | number
  size?: 'sm' | 'md' | 'lg'
  type?: string
  prependIcon?: string
  appendIcon?: string
  disabled?: boolean
  readonly?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  modelValue: '',
  size: 'md',
  type: 'text',
  prependIcon: '',
  appendIcon: '',
  disabled: false,
  readonly: false,
  placeholder: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'input': [event: Event]
  'focusIn': [event: FocusEvent]
  'focusOut': [event: FocusEvent]
  'change': [event: Event]
  'prependClick': [event: MouseEvent]
  'appendClick': [event: MouseEvent]
}>()

const inputRef = ref<HTMLInputElement>()

const inputValue = computed({
  get: () => props.modelValue,
  set: (value: string | number) => emit('update:modelValue', value),
})

// Consolidated size-based styling
const sizeClasses = computed(() => {
  const configs = {
    sm: {
      wrapper: 'h-8',
      input: 'px-3 text-sm',
      icon: 'px-2',
    },
    md: {
      wrapper: 'h-10',
      input: 'px-3 text-sm',
      icon: 'px-3',
    },
    lg: {
      wrapper: 'h-12',
      input: 'px-4 text-base',
      icon: 'px-4',
    },
  }
  return configs[props.size]
})

// Optimized computed classes
const classes = computed(() => ({
  container: 'flex flex-col flex-items-start',
  label: 'text-sm font-medium text-gray-700 dark:text-gray-300',
  wrapper: [
    'relative flex w-full items-center rounded-md border bg-white transition-colors',
    'focus-within:border-blue-500 focus-within:shadow-[0_0_0_3px_rgb(59_130_246_/_0.1)]',
    'dark:border-gray-600 dark:bg-gray-800 dark:focus-within:border-blue-400',
    props.disabled ? 'opacity-50 cursor-not-allowed' : 'border-gray-300',
    sizeClasses.value.wrapper,
  ],
  input: [
    'flex-1 border-none bg-transparent outline-none',
    'text-gray-900 placeholder-gray-400',
    'dark:text-gray-100 dark:placeholder-gray-500',
    props.disabled && 'cursor-not-allowed',
    sizeClasses.value.input,
  ],
  icon: [
    'flex cursor-pointer items-center justify-center',
    'text-gray-500 dark:text-gray-400',
    props.disabled && 'cursor-not-allowed opacity-50',
    sizeClasses.value.icon,
  ],
}))

// Event handlers with proper types
const handleInput = (event: Event) => emit('input', event)
const handleFocusIn = (event: FocusEvent) => emit('focusIn', event)
const handleFocusOut = (event: FocusEvent) => emit('focusOut', event)
const handleChange = (event: Event) => emit('change', event)

function handlePrependClick(event: MouseEvent) {
  if (!props.disabled)
    emit('prependClick', event)
}

function handleAppendClick(event: MouseEvent) {
  if (!props.disabled)
    emit('appendClick', event)
}

// Computed placeholder
const computedPlaceholder = computed(() => props.placeholder || props.label)
</script>

<template>
  <div :class="classes.container">
    <label v-if="props.label" :class="classes.label">{{ props.label }}</label>
    <div :class="classes.wrapper">
      <div v-if="props.prependIcon" :class="classes.icon" @click="handlePrependClick">
        <Icon :icon="props.prependIcon" class="h-5 w-5" />
      </div>
      <input
        ref="inputRef"
        v-model="inputValue"
        :type="props.type"
        :placeholder="computedPlaceholder"
        :disabled="props.disabled"
        :readonly="props.readonly"
        :class="classes.input"
        @input="handleInput"
        @focus="handleFocusIn"
        @blur="handleFocusOut"
        @change="handleChange"
      >
      <div v-if="props.appendIcon" :class="classes.icon" @click="handleAppendClick">
        <Icon :icon="props.appendIcon" class="h-5 w-5" />
      </div>
    </div>
  </div>
</template>
