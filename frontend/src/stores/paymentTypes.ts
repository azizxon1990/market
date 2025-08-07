import type { IPaymentType } from '~/types/information'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { http } from '~/utils/axios'

interface IPaymentTypesState {
  paymentTypes: IPaymentType[]
  loading: boolean
  saving: boolean
}

export const usePaymentTypesStore = defineStore('paymentTypes', {
  state: (): IPaymentTypesState => ({
    paymentTypes: [],
    loading: false,
    saving: false,
  }),

  actions: {
    async fetchPaymentTypes(options?: {
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

        const response = await http.get('/payment-types', { params })
        this.paymentTypes = response.data.data || response.data

        // Return both payment types and pagination metadata
        return {
          paymentTypes: this.paymentTypes,
          pagination: response.data.pagination,
        }
      }
      finally {
        this.loading = false
      }
    },
    async createPaymentType(paymentTypeData: IPaymentType) {
      try {
        this.saving = true
        const response = await http.post('/payment-types', paymentTypeData)
        const newPaymentType = response.data.data || response.data
        this.paymentTypes.unshift(newPaymentType)
        return newPaymentType
      }
      finally {
        this.saving = false
      }
    },
    async updatePaymentType(paymentTypeData: IPaymentType) {
      try {
        this.saving = true
        const response = await http.put(`/payment-types/${paymentTypeData.id}`, paymentTypeData)
        const updatedPaymentType = response.data.data || response.data

        const index = this.paymentTypes.findIndex(pt => pt.id === paymentTypeData.id)
        if (index !== -1) {
          this.paymentTypes[index] = updatedPaymentType
        }
        return updatedPaymentType
      }
      finally {
        this.saving = false
      }
    },
    async fetchActivePaymentTypesByUserOrganization() {
      try {
        const response = await http.get('/payment-types/active')
        return response.data
      }
      catch (error) {
        console.error('Error fetching active payment types:', error)
        return []
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePaymentTypesStore, import.meta.hot))
}
