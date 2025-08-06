<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface Emits {
  (e: 'logout'): void
}

const emit = defineEmits<Emits>()

const { t } = useI18n()
const authStore = useAuthStore()
const router = useRouter()

const showDropdown = ref(false)

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

function closeDropdown() {
  showDropdown.value = false
}

async function handleLogout() {
  try {
    await authStore.logout()
    await router.push('/')
  }
  catch (error) {
    console.error('Logout failed:', error)
  }
  emit('logout')
}

// Close dropdown when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.profile-dropdown')) {
      closeDropdown()
    }
  })
})

// Expose methods for parent component if needed
defineExpose({
  toggleDropdown,
  closeDropdown,
})
</script>

<template>
  <div class="profile-dropdown relative">
    <!-- Profile Button -->
    <button
      class="flex items-center rounded-lg px-3 py-2 text-sm transition-colors space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800"
      @click="toggleDropdown"
    >
      <div class="h-8 w-8 flex items-center justify-center rounded-full bg-blue-600 text-white font-medium">
        {{ (authStore.userInfo?.full_name || authStore.userInfo?.username || 'U').charAt(0).toUpperCase() }}
      </div>
      <span class="text-gray-700 font-medium dark:text-gray-300">
        {{ authStore.userInfo?.full_name || authStore.userInfo?.username }}
      </span>
      <Icon icon="ri-arrow-down-s-line" class="h-5 w-5 text-gray-500 transition-transform" :class="{ 'rotate-180': showDropdown }" />
    </button>

    <!-- Dropdown Menu -->
    <div
      v-show="showDropdown"
      class="absolute right-0 top-full mt-2 w-64 border border-gray-200 rounded-lg bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      <!-- User Info Header -->
      <div class="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <div class="flex items-center space-x-3">
          <div class="h-10 w-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-medium">
            {{ (authStore.userInfo?.full_name || authStore.userInfo?.username || 'U').charAt(0).toUpperCase() }}
          </div>
          <div>
            <p class="text-sm text-gray-900 font-medium dark:text-gray-100">
              {{ authStore.userInfo?.full_name || authStore.userInfo?.username }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              @{{ authStore.userInfo?.username }}
            </p>
            <p v-if="authStore.userInfo?.organization?.name" class="text-xs text-blue-600 dark:text-blue-400">
              {{ authStore.userInfo.organization.name }}
            </p>
          </div>
        </div>
      </div>

      <!-- Menu Items -->
      <div class="py-1">
        <router-link
          to="/profile"
          class="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="closeDropdown"
        >
          <div class="flex items-center space-x-2">
            <Icon icon="ri-user-line" class="h-5 w-5 text-gray-500" />
            <span>{{ t('nav.profile') }}</span>
          </div>
        </router-link>

        <router-link
          to="/orders"
          class="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="closeDropdown"
        >
          <div class="flex items-center space-x-2">
            <Icon icon="ri-file-list-3-line" class="h-5 w-5 text-gray-500" />
            <span>{{ t('nav.orders') }}</span>
          </div>
        </router-link>

        <router-link
          to="/settings"
          class="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="closeDropdown"
        >
          <div class="flex items-center space-x-2">
            <Icon icon="ri-settings-line" class="h-5 w-5 text-gray-500" />
            <span>{{ t('nav.settings') }}</span>
          </div>
        </router-link>
      </div>

      <!-- Logout Button -->
      <div class="border-t border-gray-200 pt-1 dark:border-gray-700">
        <button
          class="w-full px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          @click="handleLogout"
        >
          <div class="flex items-center space-x-2">
            <Icon icon="ri-logout-circle-line" class="h-5 w-5 text-red-500" />
            <span>{{ t('button.logout') }}</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
