import type { ICategory } from '~/types/information'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { http } from '~/utils/axios'

interface ICategoriesState {
  categories: ICategory[]
  activeCategories?: ICategory[]
  loading: boolean
  saving: boolean
}

export const useCategoriesStore = defineStore('categories', {
  state: (): ICategoriesState => ({
    categories: [],
    activeCategories: [],
    loading: false,
    saving: false,
  }),

  actions: {
    async fetchCategories(options?: {
      page?: number
      limit?: number
      search?: string
      status?: 'active' | 'inactive'
    }) {
      try {
        this.loading = true

        // Build query parameters
        const params: Record<string, string | number> = {}

        if (options?.page)
          params.page = options.page
        if (options?.limit)
          params.limit = options.limit
        if (options?.search)
          params.search = options.search
        if (options?.status)
          params.status = options.status

        const response = await http.get('/categories', { params })
        this.categories = response.data.data || response.data

        // Return both categories and pagination metadata
        return {
          categories: this.categories,
          pagination: response.data.pagination,
        }
      }
      finally {
        this.loading = false
      }
    },
    async createCategory(categoryData: ICategory) {
      try {
        this.saving = true
        const response = await http.post('/categories', categoryData)
        const newCategory = response.data.data || response.data
        this.categories.unshift(newCategory)
        return newCategory
      }
      finally {
        this.saving = false
      }
    },
    async updateCategory(categoryData: ICategory) {
      try {
        this.saving = true
        const response = await http.put(`/categories/${categoryData.id}`, categoryData)
        const updatedCategory = response.data.data || response.data

        const index = this.categories.findIndex(c => c.id === categoryData.id)
        if (index !== -1) {
          this.categories[index] = updatedCategory
        }
        return updatedCategory
      }
      finally {
        this.saving = false
      }
    },
    async fetchActiveCategories() {
      try {
        const response = await http.get('/categories/active')
        this.activeCategories = response.data
        return this.activeCategories
      }
      catch (error) {
        console.error('Error fetching active categories:', error)
        throw error
      }
    }
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCategoriesStore, import.meta.hot))
}
