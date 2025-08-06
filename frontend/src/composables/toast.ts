import { readonly, ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  persistent?: boolean
}

export interface ToastOptions {
  title: string
  message?: string
  duration?: number
  persistent?: boolean
}

// Global toast state
const toasts = ref<Toast[]>([])
let toastIdCounter = 0

// Generate unique ID for each toast
function generateToastId(): string {
  return `toast-${++toastIdCounter}-${Date.now()}`
}

// Add a new toast
function addToast(type: ToastType, options: ToastOptions): string {
  const toast: Toast = {
    id: generateToastId(),
    type,
    title: options.title,
    message: options.message,
    duration: options.duration ?? (type === 'error' ? 5000 : 3000),
    persistent: options.persistent ?? false,
  }

  toasts.value.push(toast)

  // Auto-remove toast after duration (unless persistent)
  if (!toast.persistent && toast.duration && toast.duration > 0) {
    setTimeout(() => {
      removeToast(toast.id)
    }, toast.duration)
  }

  return toast.id
}

// Remove a toast by ID
function removeToast(id: string) {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// Clear all toasts
function clearToasts() {
  toasts.value = []
}

// Toast helper functions
function showSuccess(options: ToastOptions): string {
  return addToast('success', options)
}

function showError(options: ToastOptions): string {
  return addToast('error', options)
}

function showWarning(options: ToastOptions): string {
  return addToast('warning', options)
}

function showInfo(options: ToastOptions): string {
  return addToast('info', options)
}

// Main composable
export function useToast() {
  return {
    toasts: readonly(toasts),
    addToast,
    removeToast,
    clearToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }
}
