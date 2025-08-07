import type { IOrganization } from '~/types/information'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { http } from '~/utils/axios'

interface IOrganizationsState {
  organizations: IOrganization[]
  loading: boolean
  saving: boolean
}

export const useOrganizationsStore = defineStore('organizations', {
  state: (): IOrganizationsState => ({
    organizations: [],
    loading: false,
    saving: false,
  }),

  actions: {
    async fetchOrganizations(options?: {
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

        const response = await http.get('/organizations', { params })
        this.organizations = response.data.data || response.data

        // Return both organizations and pagination metadata
        return {
          organizations: this.organizations,
          pagination: response.data.pagination,
        }
      }
      finally {
        this.loading = false
      }
    },
    async createOrganization(organizationData: IOrganization) {
      try {
        this.saving = true
        const response = await http.post('/organizations', organizationData)
        const newOrganization = response.data.data || response.data
        this.organizations.unshift(newOrganization)
        return newOrganization
      }
      finally {
        this.saving = false
      }
    },
    async updateOrganization(organizationData: IOrganization) {
      try {
        this.saving = true
        const response = await http.put(`/organizations/${organizationData.id}`, organizationData)
        const updatedOrganization = response.data.data || response.data

        const index = this.organizations.findIndex(o => o.id === organizationData.id)
        if (index !== -1) {
          this.organizations[index] = updatedOrganization
        }
        return updatedOrganization
      }
      finally {
        this.saving = false
      }
    },
    async fetchActiveOrganizations() {
      try {
        const response = await http.get('/organizations/active')
        return response.data
      }
      catch (error) {
        console.error('Error fetching active organizations:', error)
        return []
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOrganizationsStore, import.meta.hot))
}
