<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

interface Option {
  id: string | number
  label: string
  value: any
  disabled?: boolean
  [key: string]: any
}

interface Props {
  label?: string
  modelValue?: any
  options?: Option[]
  size?: 'sm' | 'md' | 'lg'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  loading?: boolean
  clearable?: boolean
  filterable?: boolean
  multiple?: boolean
  prependIcon?: string
  appendIcon?: string
  noDataText?: string
  loadingText?: string
  maxDisplayItems?: number
  searchPlaceholder?: string
  allowCustomValue?: boolean
  customValueText?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  options: () => [],
  size: 'md',
  placeholder: '',
  disabled: false,
  readonly: false,
  loading: false,
  clearable: true,
  filterable: true,
  multiple: false,
  prependIcon: '',
  appendIcon: '',
  noDataText: 'No options found',
  loadingText: 'Loading...',
  maxDisplayItems: 10,
  searchPlaceholder: 'Search...',
  allowCustomValue: false,
  customValueText: 'Create: "{query}"',
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
  'search': [query: string]
  'select': [option: Option]
  'create': [value: string]
  'clear': []
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
}>()

// Refs
const containerRef = ref<HTMLDivElement>()
const inputRef = ref<HTMLInputElement>()
const dropdownRef = ref<HTMLDivElement>()
const isOpen = ref(false)
const searchQuery = ref('')
const highlightedIndex = ref(-1)

// Computed properties
const selectedOptions = computed(() => {
  if (!props.modelValue)
    return []

  if (props.multiple) {
    return Array.isArray(props.modelValue)
      ? props.options.filter(option => props.modelValue.includes(option.value))
      : []
  }

  return props.options.filter(option => option.value === props.modelValue)
})

const filteredOptions = computed(() => {
  if (!props.filterable || !searchQuery.value) {
    return props.options.slice(0, props.maxDisplayItems)
  }

  const filtered = props.options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )

  return filtered.slice(0, props.maxDisplayItems)
})

const showCustomOption = computed(() => {
  return props.allowCustomValue
    && searchQuery.value
    && !filteredOptions.value.some(option =>
      option.label.toLowerCase() === searchQuery.value.toLowerCase(),
    )
})

const sizeClasses = computed(() => {
  const configs = {
    sm: {
      wrapper: 'h-8',
      input: 'px-3 text-sm',
      icon: 'px-2',
      dropdown: 'mt-1',
    },
    md: {
      wrapper: 'h-10',
      input: 'px-3 text-sm',
      icon: 'px-3',
      dropdown: 'mt-1',
    },
    lg: {
      wrapper: 'h-12',
      input: 'px-4 text-base',
      icon: 'px-4',
      dropdown: 'mt-1',
    },
  }
  return configs[props.size]
})

const classes = computed(() => ({
  container: 'relative flex flex-col flex-items-start',
  label: 'text-sm font-medium text-gray-700 dark:text-gray-300',
  wrapper: [
    'relative flex w-full items-center rounded-md border bg-white transition-colors',
    'focus-within:border-blue-500 focus-within:shadow-[0_0_0_3px_rgb(59_130_246_/_0.1)]',
    'dark:border-gray-600 dark:bg-gray-800 dark:focus-within:border-blue-400',
    isOpen.value ? 'border-blue-500 shadow-[0_0_0_3px_rgb(59_130_246_/_0.1)] dark:border-blue-400' : 'border-gray-300',
    props.disabled ? 'opacity-50 cursor-not-allowed' : '',
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
  dropdown: [
    'absolute z-50 w-full rounded-md border border-gray-200 bg-white shadow-lg',
    'dark:border-gray-600 dark:bg-gray-800',
    'max-h-60 overflow-auto',
    sizeClasses.value.dropdown,
  ],
  option: [
    'flex cursor-pointer items-center px-3 py-2 text-sm transition-colors',
    'hover:bg-gray-50 dark:hover:bg-gray-700',
    'text-gray-900 dark:text-gray-100',
  ],
  optionSelected: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
  optionHighlighted: 'bg-gray-100 dark:bg-gray-600',
  optionDisabled: 'opacity-50 cursor-not-allowed',
  noData: 'px-3 py-2 text-sm text-gray-500 dark:text-gray-400',
  multipleTag: [
    'inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-xs',
    'text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  ],
  tagRemove: 'cursor-pointer hover:text-blue-600 dark:hover:text-blue-200',
}))

// Methods
function openDropdown() {
  if (props.disabled || props.readonly)
    return

  isOpen.value = true
  highlightedIndex.value = -1

  // For filterable mode, clear the search when opening to allow typing/filtering
  // For non-filterable mode, keep the current value
  if (props.filterable && !props.multiple) {
    searchQuery.value = ''
  }

  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus()
    }
  })
}

function closeDropdown() {
  isOpen.value = false
  highlightedIndex.value = -1

  // For filterable mode, restore the selected value when closing
  // For non-filterable mode, the value is already there
  if (props.filterable && !props.multiple && props.modelValue) {
    const selectedOption = props.options.find(option => option.value === props.modelValue)
    if (selectedOption) {
      searchQuery.value = selectedOption.label
    }
  }
}

function selectOption(option: Option) {
  if (option.disabled)
    return

  if (props.multiple) {
    const currentValues = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const index = currentValues.indexOf(option.value)

    if (index > -1) {
      currentValues.splice(index, 1)
    }
    else {
      currentValues.push(option.value)
    }

    emit('update:modelValue', currentValues)
  }
  else {
    emit('update:modelValue', option.value)
    // Always show the selected item label for both filterable and non-filterable modes
    searchQuery.value = option.label
    closeDropdown()
  }

  emit('select', option)
}

function removeOption(option: Option) {
  if (!props.multiple)
    return

  const currentValues = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  const index = currentValues.indexOf(option.value)

  if (index > -1) {
    currentValues.splice(index, 1)
    emit('update:modelValue', currentValues)
  }
}

function clearSelection() {
  emit('update:modelValue', props.multiple ? [] : null)
  emit('clear')
  searchQuery.value = ''
  closeDropdown()
}

function createCustomValue() {
  if (!props.allowCustomValue || !searchQuery.value)
    return

  emit('create', searchQuery.value)
  searchQuery.value = ''
  closeDropdown()
}

function handleKeydown(event: KeyboardEvent) {
  if (!isOpen.value) {
    if (event.key === 'Enter' || event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      openDropdown()
      event.preventDefault()
    }
    return
  }

  const optionsCount = filteredOptions.value.length + (showCustomOption.value ? 1 : 0)

  switch (event.key) {
    case 'Escape':
      closeDropdown()
      event.preventDefault()
      break

    case 'ArrowDown':
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, optionsCount - 1)
      event.preventDefault()
      break

    case 'ArrowUp':
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1)
      event.preventDefault()
      break

    case 'Enter':
      if (highlightedIndex.value >= 0) {
        if (highlightedIndex.value < filteredOptions.value.length) {
          selectOption(filteredOptions.value[highlightedIndex.value])
        }
        else if (showCustomOption.value) {
          createCustomValue()
        }
      }
      event.preventDefault()
      break

    case 'Tab':
      closeDropdown()
      break
  }
}

function handleInputChange() {
  if (props.filterable) {
    emit('search', searchQuery.value)
  }
}

function handleFocus(event: FocusEvent) {
  emit('focus', event)
}

function handleBlur(event: FocusEvent) {
  emit('blur', event)
  // Delay closing to allow for option clicks
  setTimeout(() => {
    if (!containerRef.value?.contains(document.activeElement)) {
      closeDropdown()
    }
  }, 150)
}

function handleClickOutside(event: Event) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

function isOptionSelected(option: Option): boolean {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.includes(option.value)
  }
  return props.modelValue === option.value
}

// Watchers
watch(() => props.modelValue, () => {
  if (!props.multiple) {
    // Update search query with the selected option label for both filterable and non-filterable
    const selectedOption = props.options.find(option => option.value === props.modelValue)
    searchQuery.value = selectedOption ? selectedOption.label : ''
  }
})

watch(() => props.options, () => {
  // When options change (e.g., async loading), update display value if needed
  if (!props.multiple && props.modelValue) {
    const selectedOption = props.options.find(option => option.value === props.modelValue)
    searchQuery.value = selectedOption ? selectedOption.label : ''
  }
}, { deep: true })

watch(isOpen, (newValue) => {
  if (newValue) {
    document.addEventListener('click', handleClickOutside)
  }
  else {
    document.removeEventListener('click', handleClickOutside)
  }
})

// Lifecycle
onMounted(() => {
  if (!props.multiple) {
    // Initialize search query with the selected option label for both filterable and non-filterable
    const selectedOption = props.options.find(option => option.value === props.modelValue)
    searchQuery.value = selectedOption ? selectedOption.label : ''
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="containerRef" :class="classes.container">
    <!-- Label -->
    <label v-if="props.label" :class="classes.label">
      {{ props.label }}
    </label>

    <!-- Input Wrapper -->
    <div :class="classes.wrapper" @click="openDropdown">
      <!-- Prepend Icon -->
      <div v-if="props.prependIcon" :class="classes.icon">
        <Icon :icon="props.prependIcon" class="h-5 w-5" />
      </div>

      <!-- Multiple Selection Tags -->
      <div v-if="props.multiple && selectedOptions.length > 0" class="flex flex-wrap gap-1 px-2 py-1">
        <span
          v-for="option in selectedOptions"
          :key="option.id"
          :class="classes.multipleTag"
        >
          {{ option.label }}
          <Icon
            icon="ri-close-line"
            class="h-3 w-3"
            :class="classes.tagRemove"
            @click.stop="removeOption(option)"
          />
        </span>
      </div>

      <!-- Search Input -->
      <input
        ref="inputRef"
        v-model="searchQuery"
        :class="classes.input"
        :placeholder="props.multiple && selectedOptions.length > 0 ? props.searchPlaceholder : props.placeholder"
        :disabled="props.disabled"
        :readonly="props.readonly || (!props.filterable && !props.multiple)"
        @input="handleInputChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      >

      <!-- Loading Icon -->
      <div v-if="props.loading" :class="classes.icon">
        <Icon icon="ri-loader-2-line" class="h-5 w-5 animate-spin" />
      </div>

      <!-- Clear Button -->
      <div
        v-else-if="props.clearable && (selectedOptions.length > 0 || searchQuery)"
        :class="classes.icon"
        @click.stop="clearSelection"
      >
        <Icon icon="ri-close-line" class="h-5 w-5" />
      </div>

      <!-- Dropdown Arrow -->
      <div v-else :class="classes.icon">
        <Icon
          :icon="isOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"
          class="h-5 w-5 transition-transform"
        />
      </div>

      <!-- Append Icon -->
      <div v-if="props.appendIcon" :class="classes.icon">
        <Icon :icon="props.appendIcon" class="h-5 w-5" />
      </div>
    </div>

    <!-- Dropdown -->
    <div
      v-if="isOpen"
      ref="dropdownRef"
      :class="classes.dropdown"
      style="top: 100%;"
    >
      <!-- Loading State -->
      <div v-if="props.loading" :class="classes.noData">
        <Icon icon="ri-loader-2-line" class="mr-2 inline h-4 w-4 animate-spin" />
        {{ props.loadingText }}
      </div>

      <!-- Options -->
      <template v-else-if="filteredOptions.length > 0">
        <div
          v-for="(option, index) in filteredOptions"
          :key="option.id"
          :class="[
            classes.option,
            isOptionSelected(option) && classes.optionSelected,
            highlightedIndex === index && classes.optionHighlighted,
            option.disabled && classes.optionDisabled,
          ]"
          @click="selectOption(option)"
          @mouseenter="highlightedIndex = index"
        >
          <Icon
            v-if="props.multiple"
            :icon="isOptionSelected(option) ? 'ri-checkbox-line' : 'ri-checkbox-blank-line'"
            class="mr-2 h-4 w-4"
          />
          <span class="flex-1">{{ option.label }}</span>
          <Icon
            v-if="!props.multiple && isOptionSelected(option)"
            icon="ri-check-line"
            class="ml-2 h-4 w-4 text-blue-500"
          />
        </div>

        <!-- Custom Value Option -->
        <div
          v-if="showCustomOption"
          :class="[
            classes.option,
            highlightedIndex === filteredOptions.length && classes.optionHighlighted,
          ]"
          @click="createCustomValue"
          @mouseenter="highlightedIndex = filteredOptions.length"
        >
          <Icon icon="ri-add-line" class="mr-2 h-4 w-4" />
          <span>{{ props.customValueText.replace('{query}', searchQuery) }}</span>
        </div>
      </template>

      <!-- No Data -->
      <div v-else :class="classes.noData">
        <Icon icon="ri-search-line" class="mr-2 inline h-4 w-4" />
        {{ props.noDataText }}
      </div>
    </div>
  </div>
</template>
