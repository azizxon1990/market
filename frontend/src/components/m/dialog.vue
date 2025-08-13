<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  persistent: {
    type: Boolean,
    default: false,
  },
  maxWidth: {
    type: String,
    default: '500px',
  },
  size: {
    type: String,
    default: 'large',
    validator: value => ['small', 'medium', 'large', 'fullscreen'].includes(value),
  },
  closable: {
    type: Boolean,
    default: true,
  },
  scrollable: {
    type: Boolean,
    default: false,
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
  showFooter: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'close', 'open', 'afterEnter', 'afterLeave'])

const dialogRef = ref(null)

// Watch for modelValue changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    openDialog()
  }
  else {
    closeDialog()
  }
}, { immediate: true })

// Computed properties
const dialogClasses = computed(() => {
  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-2xl',
    fullscreen: 'rounded-none !fixed !inset-0',
  }

  const baseClasses = [
    'relative transform transition-all duration-300',
    'bg-white dark:bg-gray-800 rounded-lg shadow-xl',
  ]

  return [
    ...baseClasses,
    sizeClasses[props.size],
  ].join(' ')
})

const overlayClasses = computed(() => [
  'fixed inset-0 z-5000000 flex items-center justify-center',
  'bg-black bg-opacity-50 backdrop-blur-sm',
  'transition-opacity duration-300',
].join(' '))

const contentClasses = computed(() => {
  const classes = ['text-gray-900 dark:text-gray-100']

  if (props.scrollable) {
    classes.push('overflow-y-auto max-h-96')
  }
  if (props.size === 'fullscreen') {
    classes.push('px-4')
  }
  else {
    classes.push('p-6')
  }

  return classes.join(' ')
})

// Methods
function openDialog() {
  document.body.style.overflow = 'hidden'
  nextTick(() => {
    dialogRef.value?.focus()
  })
  emit('open')
}

function closeDialog() {
  if (props.persistent) {
    return
  }

  document.body.style.overflow = ''
  emit('update:modelValue', false)
  emit('close')
}

function handleOverlayClick(event) {
  if (event.target === event.currentTarget && !props.persistent) {
    closeDialog()
  }
}

function handleEscapeKey(event) {
  if (event.key === 'Escape' && props.modelValue && !props.persistent) {
    closeDialog()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog" @after-enter="emit('afterEnter')" @after-leave="emit('afterLeave')">
      <div v-if="modelValue" :class="overlayClasses" @click="handleOverlayClick">
        <div
          ref="dialogRef" :class="dialogClasses"
          :style="props.size !== 'fullscreen' ? { maxWidth: props.maxWidth } : undefined" tabindex="-1" role="dialog"
          aria-modal="true" :aria-labelledby="title ? 'dialog-title' : undefined"
        >
          <!-- Header -->
          <slot name="header">
            <div
              v-if="showHeader"
              class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700"
            >
              <h2 v-if="title" id="dialog-title" class="text-lg text-gray-900 font-semibold dark:text-gray-100">
                {{ title }}
              </h2>
              <slot v-else name="header" />

              <MButton
                v-if="closable" icon-button icon="ri-close-line" color="ghost" size="small"
                aria-label="Close dialog" @click="closeDialog"
              />
            </div>
          </slot>

          <!-- Content -->
          <div :class="contentClasses">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="showFooter" class="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-active .relative,
.dialog-leave-active .relative {
  transition: transform 0.3s ease;
}

.dialog-enter-from .relative,
.dialog-leave-to .relative {
  transform: scale(0.95) translateY(-10px);
}
</style>
