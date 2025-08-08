<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

interface Props {
  label?: string
  modelValue?: string
  size?: 'sm' | 'md' | 'lg'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  prependIcon?: string
  appendIcon?: string
  format?: string
  minDate?: string
  maxDate?: string
  showToday?: boolean
  showTime?: boolean
  timeFormat?: '12' | '24'
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  modelValue: '',
  size: 'md',
  placeholder: '',
  disabled: false,
  readonly: false,
  clearable: true,
  prependIcon: 'ri-calendar-line',
  appendIcon: '',
  format: 'YYYY-MM-DD',
  minDate: '',
  maxDate: '',
  showToday: true,
  showTime: false,
  timeFormat: '24',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
}>()

// Refs
const containerRef = ref<HTMLDivElement>()
const inputRef = ref<HTMLInputElement>()
const dropdownRef = ref<HTMLDivElement>()
const isOpen = ref(false)

// Current viewing month/year
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())

// Time values
const selectedHour = ref(0)
const selectedMinute = ref(0)

// Computed
const inputValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})

const selectedDate = computed(() => {
  if (!props.modelValue) {
    return null
  }
  return new Date(props.modelValue)
})

// Initialize time from selected date
watch(selectedDate, (newDate) => {
  if (newDate) {
    selectedHour.value = newDate.getHours()
    selectedMinute.value = newDate.getMinutes()
  }
}, { immediate: true })

// Format date for display
const displayValue = computed(() => {
  if (!props.modelValue) {
    return ''
  }

  try {
    const date = new Date(props.modelValue)
    if (props.showTime) {
      return formatDateTime(date)
    }
    return formatDate(date)
  }
  catch {
    return props.modelValue
  }
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

// Component classes
const classes = computed(() => ({
  container: 'relative flex flex-col flex-items-start',
  label: 'text-sm font-medium text-gray-700 dark:text-gray-300',
  wrapper: [
    'relative flex w-full items-center rounded-md border bg-white transition-colors',
    'focus-within:border-blue-500 focus-within:shadow-[0_0_0_3px_rgb(59_130_246_/_0.1)]',
    'dark:border-gray-600 dark:bg-gray-800 dark:focus-within:border-blue-400',
    props.disabled ? 'opacity-50 cursor-not-allowed' : 'border-gray-300',
    sizeClasses.value.wrapper,
  ],
  input: [
    'flex-1 border-none bg-transparent outline-none cursor-pointer',
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
    'absolute z-50 mt-1 w-80 rounded-md border border-gray-200 bg-white shadow-lg',
    'dark:border-gray-600 dark:bg-gray-800',
  ],
}))

// Calendar data
const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const days = []
  const currentDate = new Date(startDate)

  // Generate 6 weeks (42 days) to ensure consistent calendar size
  for (let i = 0; i < 42; i++) {
    const isCurrentMonth = currentDate.getMonth() === currentMonth.value
    const isToday = isToday_(currentDate)
    const isSelected = selectedDate.value && isSameDay(currentDate, selectedDate.value)
    const isDisabled = isDateDisabled(currentDate)

    days.push({
      date: new Date(currentDate),
      day: currentDate.getDate(),
      isCurrentMonth,
      isToday,
      isSelected,
      isDisabled,
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return days
})

// Time options
const hourOptions = computed(() => {
  const hours = []
  const max = props.timeFormat === '12' ? 12 : 23
  for (let i = props.timeFormat === '12' ? 1 : 0; i <= max; i++) {
    hours.push({ value: i, label: i.toString().padStart(2, '0') })
  }
  return hours
})

const minuteOptions = computed(() => {
  const minutes = []
  for (let i = 0; i < 60; i += 5) { // 5-minute intervals
    minutes.push({ value: i, label: i.toString().padStart(2, '0') })
  }
  return minutes
})

// Methods
function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

function formatDateTime(date: Date): string {
  const dateStr = formatDate(date)
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')
  return `${dateStr} ${hour}:${minute}`
}

function isToday_(date: Date): boolean {
  const today = new Date()
  return isSameDay(date, today)
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getDate() === date2.getDate()
    && date1.getMonth() === date2.getMonth()
    && date1.getFullYear() === date2.getFullYear()
}

function isDateDisabled(date: Date): boolean {
  if (props.minDate) {
    const minDate = new Date(props.minDate)
    if (date < minDate) {
      return true
    }
  }

  if (props.maxDate) {
    const maxDate = new Date(props.maxDate)
    if (date > maxDate) {
      return true
    }
  }

  return false
}

function selectDate(day: any) {
  if (day.isDisabled) {
    return
  }

  const newDate = new Date(day.date)

  if (props.showTime) {
    newDate.setHours(selectedHour.value, selectedMinute.value)
    const isoString = newDate.toISOString()
    inputValue.value = isoString
    emit('change', isoString)
  }
  else {
    const dateString = newDate.toISOString().split('T')[0]
    inputValue.value = dateString
    emit('change', dateString)
    closeDropdown()
  }
}

function selectToday() {
  const today = new Date()

  if (props.showTime) {
    today.setHours(selectedHour.value, selectedMinute.value)
    const isoString = today.toISOString()
    inputValue.value = isoString
    emit('change', isoString)
  }
  else {
    const dateString = today.toISOString().split('T')[0]
    inputValue.value = dateString
    emit('change', dateString)
    closeDropdown()
  }
}

function clearValue() {
  inputValue.value = ''
  emit('change', '')
  closeDropdown()
}

function openDropdown() {
  if (props.disabled || props.readonly) {
    return
  }

  isOpen.value = true

  // Set calendar to selected date or current date
  if (selectedDate.value) {
    currentMonth.value = selectedDate.value.getMonth()
    currentYear.value = selectedDate.value.getFullYear()
  }

  nextTick(() => {
    // Focus management or scroll to selected date if needed
  })
}

function closeDropdown() {
  isOpen.value = false
}

function toggleDropdown() {
  if (isOpen.value) {
    closeDropdown()
  }
  else {
    openDropdown()
  }
}

function previousMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  }
  else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  }
  else {
    currentMonth.value++
  }
}

function updateTime() {
  if (!selectedDate.value) {
    return
  }

  const newDate = new Date(selectedDate.value)
  newDate.setHours(selectedHour.value, selectedMinute.value)
  const isoString = newDate.toISOString()
  inputValue.value = isoString
  emit('change', isoString)
}

function confirmDateTime() {
  updateTime()
  closeDropdown()
}

// Event handlers
function handleInputClick() {
  toggleDropdown()
}

function handleInputFocus(event: FocusEvent) {
  emit('focus', event)
}

function handleInputBlur(event: FocusEvent) {
  emit('blur', event)
}

function handleIconClick() {
  if (props.clearable && props.modelValue) {
    clearValue()
  }
  else {
    toggleDropdown()
  }
}

// Outside click handler
function handleOutsideClick(event: Event) {
  if (!containerRef.value?.contains(event.target as Node)) {
    closeDropdown()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})

// Computed placeholder
const computedPlaceholder = computed(() => {
  if (props.placeholder) {
    return props.placeholder
  }
  if (props.label) {
    return props.label
  }
  return props.showTime ? 'Select date and time' : 'Select date'
})
</script>

<template>
  <div ref="containerRef" :class="classes.container">
    <label v-if="props.label" :class="classes.label">{{ props.label }}</label>

    <div :class="classes.wrapper">
      <!-- Prepend Icon -->
      <div v-if="props.prependIcon" :class="classes.icon" @click="handleIconClick">
        <Icon :icon="props.prependIcon" class="h-5 w-5" />
      </div>

      <!-- Input -->
      <input
        ref="inputRef"
        :value="displayValue"
        :placeholder="computedPlaceholder"
        :disabled="props.disabled"
        :readonly="true"
        :class="classes.input"
        @click="handleInputClick"
        @focus="handleInputFocus"
        @blur="handleInputBlur"
      >

      <!-- Clear/Append Icon -->
      <div v-if="props.clearable && props.modelValue" :class="classes.icon" @click="clearValue">
        <Icon icon="ri-close-line" class="h-5 w-5" />
      </div>
      <div v-else-if="props.appendIcon" :class="classes.icon" @click="handleIconClick">
        <Icon :icon="props.appendIcon" class="h-5 w-5" />
      </div>
    </div>

    <!-- Dropdown -->
    <div v-if="isOpen" ref="dropdownRef" :class="classes.dropdown">
      <!-- Calendar Header -->
      <div class="flex items-center justify-between border-b border-gray-200 p-3 dark:border-gray-600">
        <button
          type="button"
          class="rounded p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          @click="previousMonth"
        >
          <Icon icon="ri-arrow-left-s-line" class="h-5 w-5" />
        </button>

        <div class="text-gray-900 font-medium dark:text-gray-100">
          {{ monthNames[currentMonth] }} {{ currentYear }}
        </div>

        <button
          type="button"
          class="rounded p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          @click="nextMonth"
        >
          <Icon icon="ri-arrow-right-s-line" class="h-5 w-5" />
        </button>
      </div>

      <!-- Calendar Grid -->
      <div class="p-3">
        <!-- Week Days Header -->
        <div class="grid grid-cols-7 mb-2 gap-1">
          <div
            v-for="day in weekDays"
            :key="day"
            class="text-center text-xs text-gray-500 font-medium dark:text-gray-400"
          >
            {{ day }}
          </div>
        </div>

        <!-- Calendar Days -->
        <div class="grid grid-cols-7 gap-1">
          <button
            v-for="day in calendarDays"
            :key="`${day.date.getTime()}`"
            type="button"
            :disabled="day.isDisabled"
            class="h-8 w-8 flex items-center justify-center rounded text-sm transition-colors"
            :class="{
              'text-gray-400 dark:text-gray-600': !day.isCurrentMonth,
              'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700': day.isCurrentMonth && !day.isSelected && !day.isDisabled,
              'bg-blue-500 text-white hover:bg-blue-600': day.isSelected,
              'ring-2 ring-blue-200 dark:ring-blue-800': day.isToday && !day.isSelected,
              'cursor-not-allowed opacity-50': day.isDisabled,
              'font-semibold': day.isToday,
            }"
            @click="selectDate(day)"
          >
            {{ day.day }}
          </button>
        </div>
      </div>

      <!-- Time Picker (if enabled) -->
      <div v-if="props.showTime" class="border-t border-gray-200 p-3 dark:border-gray-600">
        <div class="mb-3 text-sm text-gray-700 font-medium dark:text-gray-300">
          Select Time
        </div>
        <div class="flex items-center space-x-2">
          <!-- Hour -->
          <select
            v-model="selectedHour"
            class="border border-gray-300 rounded bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            @change="updateTime"
          >
            <option v-for="hour in hourOptions" :key="hour.value" :value="hour.value">
              {{ hour.label }}
            </option>
          </select>

          <span class="text-gray-500 dark:text-gray-400">:</span>

          <!-- Minute -->
          <select
            v-model="selectedMinute"
            class="border border-gray-300 rounded bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            @change="updateTime"
          >
            <option v-for="minute in minuteOptions" :key="minute.value" :value="minute.value">
              {{ minute.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="border-t border-gray-200 p-3 dark:border-gray-600">
        <div class="flex items-center justify-between">
          <button
            v-if="props.showToday"
            type="button"
            class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            @click="selectToday"
          >
            Today
          </button>

          <div class="flex space-x-2">
            <button
              v-if="props.showTime"
              type="button"
              class="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
              @click="confirmDateTime"
            >
              Confirm
            </button>
            <button
              v-else
              type="button"
              class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              @click="closeDropdown"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
