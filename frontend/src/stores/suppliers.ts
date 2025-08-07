import type { ISupplier } from '~/types/information'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { http } from '~/utils/axios'

interface ISuppliersState {
  suppliers: ISupplier[]
  loading: boolean
  saving: boolean
}

export const useSuppliersStore = defineStore('suppliers', {
  state: (): ISuppliersState => ({
    suppliers: [],
    loading: false,
    saving: false,
  }),

  actions: {
    async fetchSuppliers(options?: {
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

        const response = await http.get('/suppliers', { params })
        this.suppliers = response.data.data || response.data

        // Return both suppliers and pagination metadata
        return {
          suppliers: this.suppliers,
          pagination: response.data.pagination,
        }
      }
      finally {
        this.loading = false
      }
    },
    async createSupplier(supplierData: ISupplier) {
      try {
        this.saving = true
        const response = await http.post('/suppliers', supplierData)
        const newSupplier = response.data.data || response.data
        this.suppliers.unshift(newSupplier)
        return newSupplier
      }
      finally {
        this.saving = false
      }
    },
    async updateSupplier(supplierData: ISupplier) {
      try {
        this.saving = true
        const response = await http.put(`/suppliers/${supplierData.id}`, supplierData)
        const updatedSupplier = response.data.data || response.data

        const index = this.suppliers.findIndex(s => s.id === supplierData.id)
        if (index !== -1) {
          this.suppliers[index] = updatedSupplier
        }
        return updatedSupplier
      }
      finally {
        this.saving = false
      }
    },
    async fetchActiveSuppliers() {
      try {
        const response = await http.get('/suppliers/active')
        return response.data
      }
      catch (error) {
        console.error('Error fetching active suppliers:', error)
        return []
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSuppliersStore, import.meta.hot))
}
