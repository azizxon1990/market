<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  rows: {
    type: [Number, String],
    default: 4,
  },
  cols: {
    type: [Number, String],
    default: null,
  },
  maxlength: {
    type: [Number, String],
    default: null,
  },
  error: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  showCharCount: {
    type: Boolean,
    default: false,
  },
  resize: {
    type: String,
    default: 'vertical',
    validator: value => ['none', 'both', 'horizontal', 'vertical'].includes(value),
  },
  size: {
    type: String,
    default: 'medium',
    validator: value => ['small', 'medium', 'large'].includes(value),
  },
})

const emit = defineEmits(['update:modelValue', 'input', 'blur', 'focus', 'change'])

const internalValue = ref(props.modelValue)
const inputId = `textarea-${Math.random().toString(36).slice(2, 11)}`

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  internalValue.value = newValue
})

// Computed properties
const characterCount = computed(() => internalValue.value?.length ?? 0)

const textareaClasses = computed(() => {
  const baseClasses = [
    'w-full font-inherit leading-relaxed transition-all duration-150',
    'border border-gray-300 rounded-md',
    'bg-white text-gray-900',
    'focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100',
    'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100',
    'dark:focus:border-blue-400 dark:focus:ring-blue-900',
  ]

  // Size variants
  const sizeClasses = {
    small: 'p-2 text-sm',
    medium: 'p-3 text-sm',
    large: 'p-4 text-base',
  }

  // Resize variants
  const resizeClasses = {
    none: 'resize-none',
    both: 'resize',
    horizontal: 'resize-x',
    vertical: 'resize-y',
  }

  // State classes
  const stateClasses = []

  if (props.disabled) {
    stateClasses.push(
      'cursor-not-allowed bg-gray-50 text-gray-500',
      'dark:bg-gray-900 dark:text-gray-400',
    )
  }

  if (props.readonly) {
    stateClasses.push('bg-gray-50 dark:bg-gray-900')
  }

  if (props.error) {
    stateClasses.push(
      'border-red-500 focus:border-red-500 focus:ring-red-100',
      'dark:focus:ring-red-900',
    )
  }

  return [
    ...baseClasses,
    sizeClasses[props.size],
    resizeClasses[props.resize],
    ...stateClasses,
  ].join(' ')
})

// Event handlers
function onInput(event) {
  const value = event.target.value
  internalValue.value = value
  emit('update:modelValue', value)
  emit('input', event)
}

function onBlur(event) {
  emit('blur', event)
}

function onFocus(event) {
  emit('focus', event)
}

function onChange(event) {
  emit('change', event)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <label v-if="label" :for="inputId" class="text-sm text-gray-700 font-medium dark:text-gray-300">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <textarea
        :id="inputId"
        v-model="internalValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :rows="rows"
        :cols="cols"
        :maxlength="maxlength"
        :required="required"
        :class="textareaClasses"
        @input="onInput"
        @blur="onBlur"
        @focus="onFocus"
        @change="onChange"
      />

      <div
        v-if="showCharCount && maxlength"
        class="absolute bottom-2 right-3 rounded bg-white bg-opacity-90 px-1 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:bg-opacity-90 dark:text-gray-400"
      >
        {{ characterCount }}/{{ maxlength }}
      </div>
    </div>

    <div v-if="error" class="text-sm text-red-500">
      {{ error }}
    </div>

    <div v-if="hint && !error" class="text-sm text-gray-500 dark:text-gray-400">
      {{ hint }}
    </div>
  </div>
</template>
