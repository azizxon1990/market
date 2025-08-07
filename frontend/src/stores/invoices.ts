import { defineStore } from 'pinia'
import type { IInvoice } from '~/types/information'
import { http } from '~/utils/axios'

interface PaginationResponse {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface FetchInvoicesParams {
  page?: number
  limit?: number
  search?: string
  startDate?: string
  endDate?: string
  warehouseId?: number
  supplierId?: number
  sortField?: string
  sortDirection?: 'ASC' | 'DESC'
}

interface InvoicesResponse {
  data: IInvoice[]
  pagination: PaginationResponse
}

export const useInvoicesStore = defineStore('invoices', () => {
  const invoices = ref<IInvoice[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch invoices with pagination and filters
  async function fetchInvoices(params: FetchInvoicesParams = {}): Promise<InvoicesResponse | null> {
    loading.value = true
    error.value = null

    try {
      const response = await http.get('/invoices', { params })
      
      invoices.value = response.data.data
      return response.data
    }
    catch (err: any) {
      error.value = err.message || 'Failed to fetch invoices'
      console.error('Error fetching invoices:', err)
      return null
    }
    finally {
      loading.value = false
    }
  }

  // Fetch single invoice by ID
  async function fetchInvoice(id: number): Promise<IInvoice | null> {
    loading.value = true
    error.value = null

    try {
      const response = await http.get(`/invoices/${id}`)
      return response.data
    }
    catch (err: any) {
      error.value = err.message || 'Failed to fetch invoice'
      console.error('Error fetching invoice:', err)
      return null
    }
    finally {
      loading.value = false
    }
  }

  // Create new invoice
  async function createInvoice(invoiceData: IInvoice): Promise<IInvoice | null> {
    loading.value = true
    error.value = null

    try {
      const response = await http.post('/invoices', {
        date: invoiceData.invoice_date,
        warehouse_id: invoiceData.warehouse_id,
        supplier_id: invoiceData.supplier_id,
        other_source_id: invoiceData.other_source_id,
        commentary: invoiceData.description,
        products: invoiceData.items?.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          discount_percentage: item.discount_percentage || 0,
          discount_amount: item.discount_amount || 0,
          exchange_rate: item.exchange_rate || null,
        })) || [],
      })

      return response.data.data
    }
    catch (err: any) {
      error.value = err.message || 'Failed to create invoice'
      console.error('Error creating invoice:', err)
      return null
    }
    finally {
      loading.value = false
    }
  }

  // Update existing invoice
  async function updateInvoice(id: number, invoiceData: IInvoice): Promise<IInvoice | null> {
    loading.value = true
    error.value = null

    try {
      const response = await http.put(`/invoices/${id}`, {
        date: invoiceData.invoice_date,
        warehouse_id: invoiceData.warehouse_id,
        supplier_id: invoiceData.supplier_id,
        other_source_id: invoiceData.other_source_id,
        commentary: invoiceData.description,
        products: invoiceData.items?.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          discount_percentage: item.discount_percentage || 0,
          discount_amount: item.discount_amount || 0,
          exchange_rate: item.exchange_rate || null,
        })) || [],
      })

      return response.data.data
    }
    catch (err: any) {
      error.value = err.message || 'Failed to update invoice'
      console.error('Error updating invoice:', err)
      return null
    }
    finally {
      loading.value = false
    }
  }

  // Delete invoice
  async function deleteInvoice(id: number): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      await http.delete(`/invoices/${id}`)

      // Remove from local state
      invoices.value = invoices.value.filter(invoice => invoice.id !== id)
      return true
    }
    catch (err: any) {
      error.value = err.message || 'Failed to delete invoice'
      console.error('Error deleting invoice:', err)
      return false
    }
    finally {
      loading.value = false
    }
  }

  // Clear error
  function clearError() {
    error.value = null
  }

  return {
    invoices: readonly(invoices),
    loading: readonly(loading),
    error: readonly(error),
    fetchInvoices,
    fetchInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    clearError,
  }
})
