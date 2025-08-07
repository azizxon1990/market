<script setup lang="ts">
import { Icon } from '@iconify/vue'

const { t } = useI18n()

const sidebarOpen = ref(false)

// Navigation constants
const navigations = [
  {
    name: 'nav.home',
    to: '/',
    icon: 'ri-home-line',
  },
  {
    name: 'nav.information',
    to: '/informations',
    icon: 'ri-information-line',
    children: [
      {
        name: 'nav.categories',
        to: '/informations/categories',
        icon: 'ri-folder-line',
      },
      {
        name: 'nav.products',
        to: '/informations/products',
        icon: 'ri-product-hunt-line',
      },
      {
        name: 'nav.suppliers',
        to: '/informations/suppliers',
        icon: 'ri-truck-line',
      },
      {
        name: 'nav.organizations',
        to: '/informations/organizations',
        icon: 'ri-building-line',
      },
      {
        name: 'nav.warehouses',
        to: '/informations/warehouses',
        icon: 'ri-store-line',
      },
      {
        name: 'nav.payment_types',
        to: '/informations/paymentTypes',
        icon: 'ri-bank-card-line',
      },
      {
        name: 'nav.other_sources',
        to: '/informations/otherSources',
        icon: 'ri-external-link-line',
      },
      {
        name: 'nav.cost_types',
        to: '/informations/costTypes',
        icon: 'ri-price-tag-line',
      },
    ],
  },
  {
    name: 'nav.operations',
    to: '/operations',
    icon: 'ri-settings-line',
    children: [
      {
        name: 'nav.input_products_supplier',
        to: '/operations/supplier-invoices/input',
        icon: 'ri-download-line',
      },
      {
        name: 'nav.output_products_supplier',
        to: '/operations/supplier-invoices/output',
        icon: 'ri-upload-line',
      },
      {
        name: 'nav.input_products_other_sources',
        to: '/operations/other-sources-invoices/input',
        icon: 'ri-download-2-line',
      },
      {
        name: 'nav.output_products_other_sources',
        to: '/operations/other-sources-invoices/output',
        icon: 'ri-upload-2-line',
      },
    ],
  },

]

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function closeSidebar() {
  sidebarOpen.value = false
}
</script>

<template>
  <!-- Mobile menu button -->
  <div class="fixed left-4 top-4 z-50 lg:hidden">
    <button
      class="rounded-md bg-white p-2 text-gray-400 shadow-lg dark:bg-gray-800 hover:bg-gray-50 dark:text-gray-300 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-gray-700"
      @click="toggleSidebar"
    >
      <Icon icon="ri-menu-line" class="h-6 w-6" />
    </button>
  </div>

  <!-- Overlay for mobile -->
  <div
    v-if="sidebarOpen"
    class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
    @click="closeSidebar"
  />

  <!-- Sidebar -->
  <aside
    class="fixed inset-y-0 left-0 z-50 w-64 transform border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out lg:translate-x-0 dark:border-gray-700 dark:bg-gray-900"
    :class="{
      'translate-x-0': sidebarOpen,
      '-translate-x-full': !sidebarOpen,
    }"
  >
    <!-- Sidebar Header -->
    <div class="h-16 flex items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700">
      <router-link to="/" class="flex items-center space-x-2" @click="closeSidebar">
        <div class="text-xl text-blue-600 font-bold dark:text-blue-400">
          {{ t('home.title').split(' - ')[0] }}
        </div>
      </router-link>
      <!-- Close button for mobile -->
      <button
        class="rounded-md p-1 text-gray-400 lg:hidden hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800"
        @click="closeSidebar"
      >
        <Icon icon="ri-close-line" class="h-5 w-5" />
      </button>
    </div>

    <!-- Sidebar Content -->
    <div class="h-full flex flex-col shadow-lg dark:shadow-gray-800">
      <!-- Navigation Links -->
      <nav class="flex-1 px-4 py-4 space-y-1">
        <template v-for="nav in navigations" :key="nav.to">
          <!-- Parent Navigation Item -->
          <router-link
            :to="nav.to"
            class="group flex items-center rounded-lg px-3 py-2 text-sm text-gray-700 font-medium transition-colors hover:bg-gray-100 dark:text-gray-300 hover:text-blue-600 dark:hover:bg-gray-800 dark:hover:text-blue-400"
            @click="closeSidebar"
          >
            <Icon :icon="nav.icon" class="mr-3 h-5 w-5" />
            {{ t(nav.name) }}
          </router-link>

          <!-- Child Navigation Items -->
          <div v-if="nav.children" class="ml-6 space-y-1">
            <router-link
              v-for="child in nav.children"
              :key="child.to"
              :to="child.to"
              class="group flex items-center rounded-lg px-3 py-2 text-sm text-gray-600 font-medium transition-colors hover:bg-gray-100 dark:text-gray-400 hover:text-blue-600 dark:hover:bg-gray-800 dark:hover:text-blue-400"
              @click="closeSidebar"
            >
              <Icon :icon="child.icon" class="mr-3 h-4 w-4" />
              {{ t(child.name) }}
            </router-link>
          </div>
        </template>
      </nav>

      <!-- Search Section -->
      <div class="border-t border-gray-200 px-4 pt-4 dark:border-gray-700">
        <div class="relative">
          <Icon icon="ri-search-line" class="absolute left-3 top-1/2 h-4 w-4 text-gray-400 -translate-y-1/2" />
          <input
            type="text"
            :placeholder="t('button.search')"
            class="w-full border border-gray-300 rounded-lg bg-white py-2 pl-10 pr-3 text-sm text-gray-900 outline-none dark:border-gray-600 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
          >
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* Active route styling */
.router-link-active {
  background-color: rgb(239 246 255);
  color: rgb(37 99 235);
}

.dark .router-link-active {
  background-color: rgb(30 58 138 / 0.2);
  color: rgb(96 165 250);
}
</style>
