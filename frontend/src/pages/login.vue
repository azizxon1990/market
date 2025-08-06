<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

defineOptions({
  name: 'LoginPage',
})

const { t } = useI18n()
const authStore = useAuthStore()

const username = ref<string>('')
const password = ref<string>('')
const rememberMe = ref<boolean>(false)
const error = ref<string>('')
const showPassword = ref<boolean>(false)
const isLoading = ref<boolean>(false)

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

async function handleLogin() {
  if (isLoading.value)
    return // Prevent multiple submissions

  error.value = ''
  isLoading.value = true

  try {
    await authStore.login(username.value, password.value, rememberMe.value)
    window.location.href = '/'
  }
  catch (err: any) {
    error.value = err.message || t('common.error')
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl text-gray-900 font-extrabold dark:text-white">
          {{ t('auth.login') }}
        </h2>
        <p v-if="error" class="mt-2 text-center text-sm text-red-600">
          {{ error }}
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <m-input
            v-model="username"
            :label="t('auth.email')"
            type="text"
            prepend-icon="ri-mail-line"
            :disabled="isLoading"
          />

          <m-input
            v-model="password"
            :label="t('auth.password')"
            :type="showPassword ? 'text' : 'password'"
            prepend-icon="ri-lock-line"
            :append-icon="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'"
            :disabled="isLoading"
            @append-click="togglePasswordVisibility"
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="rememberMe"
              name="remember-me"
              type="checkbox"
              :disabled="isLoading"
              class="h-4 w-4 cursor-pointer border-gray-300 rounded text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 focus:ring-blue-500"
            >
            <label for="remember-me" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              {{ t('auth.remember_me') }}
            </label>
          </div>
        </div>

        <div>
          <m-button
            type="submit"
            color="primary"
            class="w-full"
            :loading="isLoading"
            :disabled="isLoading"
          >
            {{ isLoading ? t('common.loading') : t('button.login') }}
          </m-button>
        </div>
      </form>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: auth
</route>
