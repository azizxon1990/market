import type { IProduct } from '~/types/information'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { http } from '~/utils/axios'

interface IProductsState {
  products: IProduct[]
  loading: boolean
  saving: boolean
}

export const useProductsStore = defineStore('products', {
  state: (): IProductsState => ({
    products: [],
    loading: false,
    saving: false,
  }),

  actions: {
    async fetchProducts(options?: {
      page?: number
      limit?: number
      search?: string
      status?: 'active' | 'inactive'
      categoryId?: number
      sortField?: string
      sortDirection?: 'ASC' | 'DESC'
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
        if (options?.categoryId)
          params.categoryId = options.categoryId
        if (options?.sortField)
          params.sortField = options.sortField
        if (options?.sortDirection)
          params.sortDirection = options.sortDirection

        const response = await http.get('/products', { params })
        this.products = response.data.data || response.data

        // Return both products and pagination metadata
        return {
          products: this.products,
          pagination: response.data.pagination,
        }
      }
      finally {
        this.loading = false
      }
    },

    async createProduct(productData: IProduct) {
      try {
        this.saving = true
        const response = await http.post('/products', productData)
        const newProduct = response.data.data || response.data
        this.products.unshift(newProduct)
        return newProduct
      }
      finally {
        this.saving = false
      }
    },

    async updateProduct(productData: IProduct) {
      try {
        this.saving = true
        const response = await http.put(`/products/${productData.id}`, productData)
        const updatedProduct = response.data.data || response.data

        const index = this.products.findIndex(p => p.id === productData.id)
        if (index !== -1) {
          this.products[index] = updatedProduct
        }
        return updatedProduct
      }
      finally {
        this.saving = false
      }
    },

    async getActiveProducts() {
      try {
        this.loading = true
        const response = await http.get('/products/active')
        return response.data
      }
      finally {
        this.loading = false
      }
    },

    async searchActiveProducts(query: string, categoryId?: number) {
      try {
        this.loading = true
        const params: Record<string, string | number> = { query }
        if (categoryId) params.category_id = categoryId
        
        const response = await http.get('/products/search', { params })
        return response.data.products
      }
      finally {
        this.loading = false
      }
    },

    async importFromExcel(file: File) {
      try {
        this.saving = true
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await http.post('/products/import', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        return response.data
      }
      finally {
        this.saving = false
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProductsStore, import.meta.hot))
}
