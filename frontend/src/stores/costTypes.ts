import type { ICostType } from '~/types/information'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { http } from '~/utils/axios'

interface ICostTypesState {
  costTypes: ICostType[]
  loading: boolean
  saving: boolean
}

export const useCostTypesStore = defineStore('costTypes', {
  state: (): ICostTypesState => ({
    costTypes: [],
    loading: false,
    saving: false,
  }),

  actions: {
    async fetchCostTypes(options?: {
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

        const response = await http.get('/cost-types', { params })
        this.costTypes = response.data.data || response.data

        // Return both cost types and pagination metadata
        return {
          costTypes: this.costTypes,
          pagination: response.data.pagination,
        }
      }
      finally {
        this.loading = false
      }
    },
    async createCostType(costTypeData: ICostType) {
      try {
        this.saving = true
        const response = await http.post('/cost-types', costTypeData)
        const newCostType = response.data.data || response.data
        this.costTypes.unshift(newCostType)
        return newCostType
      }
      finally {
        this.saving = false
      }
    },
    async updateCostType(costTypeData: ICostType) {
      try {
        this.saving = true
        const response = await http.put(`/cost-types/${costTypeData.id}`, costTypeData)
        const updatedCostType = response.data.data || response.data

        const index = this.costTypes.findIndex(ct => ct.id === costTypeData.id)
        if (index !== -1) {
          this.costTypes[index] = updatedCostType
        }
        return updatedCostType
      }
      finally {
        this.saving = false
      }
    },
    async fetchActiveCostTypesByUserOrganization() {
      try {
        const response = await http.get('/cost-types/active')
        return response.data
      }
      catch (error) {
        console.error('Error fetching active cost types:', error)
        return []
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCostTypesStore, import.meta.hot))
}
