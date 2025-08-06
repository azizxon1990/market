<script setup lang="ts">
import MToast from '~/components/m/toast.vue'
import { useToast } from '~/composables/toast'

const { toasts, removeToast } = useToast()

function handleToastClose(id: string) {
  removeToast(id)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="toasts.length > 0"
      class="pointer-events-none fixed inset-0 z-50 flex items-end px-4 py-6 sm:items-start sm:p-6"
    >
      <div class="w-full flex flex-col items-center sm:items-end space-y-4">
        <TransitionGroup
          name="toast"
          tag="div"
          class="pointer-events-auto max-w-sm w-full space-y-3"
        >
          <MToast
            v-for="toast in toasts"
            :key="toast.id"
            :toast="toast"
            @close="handleToastClose"
          />
        </TransitionGroup>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-move {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
