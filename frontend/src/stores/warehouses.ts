import type { IWarehouse } from '~/types/information'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { http } from '~/utils/axios'

interface IWarehousesState {
  warehouses: IWarehouse[]
  activeWarehouses?: IWarehouse[]
  loading: boolean
  saving: boolean
}

export const useWarehousesStore = defineStore('warehouses', {
  state: (): IWarehousesState => ({
    warehouses: [],
    activeWarehouses: [],
    loading: false,
    saving: false,
  }),

  actions: {
    async fetchWarehouses(options?: {
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

        const response = await http.get('/warehouses', { params })
        this.warehouses = response.data.data || response.data

        // Return both warehouses and pagination metadata
        return {
          warehouses: this.warehouses,
          pagination: response.data.pagination,
        }
      }
      finally {
        this.loading = false
      }
    },
    async createWarehouse(warehouseData: IWarehouse) {
      try {
        this.saving = true
        const response = await http.post('/warehouses', warehouseData)
        const newWarehouse = response.data.data || response.data
        this.warehouses.unshift(newWarehouse)
        return newWarehouse
      }
      finally {
        this.saving = false
      }
    },
    async updateWarehouse(warehouseData: IWarehouse) {
      try {
        this.saving = true
        const response = await http.put(`/warehouses/${warehouseData.id}`, warehouseData)
        const updatedWarehouse = response.data.data || response.data

        const index = this.warehouses.findIndex(w => w.id === warehouseData.id)
        if (index !== -1) {
          this.warehouses[index] = updatedWarehouse
        }
        return updatedWarehouse
      }
      finally {
        this.saving = false
      }
    },
    async fetchActiveWarehousesByOrganization(organizationId: number | null = null) {
      if (!organizationId) {
        organizationId = useAuthStore().userInfo?.organization_id || null
      }
      try {
        const response = await http.get(`/warehouses/organization/${organizationId}`)
        this.activeWarehouses = response.data.data || response.data
        return this.activeWarehouses
      }
      catch (error) {
        console.error('Error fetching active warehouses:', error)
        return []
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useWarehousesStore, import.meta.hot))
}
