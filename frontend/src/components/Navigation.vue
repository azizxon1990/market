<script setup lang="ts">
import { Icon } from '@iconify/vue'
import ProfileDropdown from './ProfileDropdown.vue'

const { t } = useI18n()
const isDark = useDark()
const toggleDark = useToggle(isDark)
const authStore = useAuthStore()
</script>

<template>
  <nav class="sticky top-0 z-10000 h-16 w-full border-b bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
    <div class="max-w-full px-4 lg:px-8 sm:px-6">
      <div class="h-16 flex items-center justify-end">
        <!-- Right side items only -->
        <div class="flex items-center space-x-4">
          <!-- Theme toggle -->
          <button
            class="icon-btn !outline-none"
            :title="t('button.toggle_dark')"
            @click="toggleDark()"
          >
            <Icon :icon="isDark ? 'ri-moon-line' : 'ri-sun-line'" class="h-5 w-5" />
          </button>

          <!-- Language switcher -->
          <LanguageSwitcher />

          <!-- Profile/Auth -->
          <ProfileDropdown v-if="authStore.isLoggedIn" />
          <router-link
            v-else
            to="/login"
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white font-medium transition-colors hover:bg-blue-700"
          >
            {{ t('button.login') }}
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>
