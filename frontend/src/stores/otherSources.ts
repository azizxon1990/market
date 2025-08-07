import type { IOtherSource } from '~/types/information'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { http } from '~/utils/axios'

interface IOtherSourcesState {
  otherSources: IOtherSource[]
  loading: boolean
  saving: boolean
}

export const useOtherSourcesStore = defineStore('otherSources', {
  state: (): IOtherSourcesState => ({
    otherSources: [],
    loading: false,
    saving: false,
  }),

  actions: {
    async fetchOtherSources(options?: {
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

        const response = await http.get('/other-sources', { params })
        this.otherSources = response.data.data || response.data

        // Return both other sources and pagination metadata
        return {
          otherSources: this.otherSources,
          pagination: response.data.pagination,
        }
      }
      finally {
        this.loading = false
      }
    },
    async createOtherSource(otherSourceData: IOtherSource) {
      try {
        this.saving = true
        const response = await http.post('/other-sources', otherSourceData)
        const newOtherSource = response.data.data || response.data
        this.otherSources.unshift(newOtherSource)
        return newOtherSource
      }
      finally {
        this.saving = false
      }
    },
    async updateOtherSource(otherSourceData: IOtherSource) {
      try {
        this.saving = true
        const response = await http.put(`/other-sources/${otherSourceData.id}`, otherSourceData)
        const updatedOtherSource = response.data.data || response.data

        const index = this.otherSources.findIndex(os => os.id === otherSourceData.id)
        if (index !== -1) {
          this.otherSources[index] = updatedOtherSource
        }
        return updatedOtherSource
      }
      finally {
        this.saving = false
      }
    },
    async fetchActiveOtherSources() {
      try {
        const response = await http.get('/other-sources/active')
        return response.data
      }
      catch (error) {
        console.error('Error fetching active other sources:', error)
        return []
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOtherSourcesStore, import.meta.hot))
}
