export interface ICategory {
  id: number
  name: string
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export const defaultCategory: ICategory = {
  id: 0,
  name: '',
  active: true,
}

export interface IProduct {
  id: number
  name: string
  category_id: number
  unit: string
  description?: string
  active: boolean
  category?: ICategory
  createdAt?: string
  updatedAt?: string
}

export const defaultProduct: IProduct = {
  id: 0,
  name: '',
  category_id: 0,
  unit: '',
  description: '',
  active: true,
}

export interface ISupplier {
  id: number
  name: string
  phone_number?: string
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export const defaultSupplier: ISupplier = {
  id: 0,
  name: '',
  phone_number: '',
  active: true,
}

export interface IOrganization {
  id: number
  name: string
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export const defaultOrganization: IOrganization = {
  id: 0,
  name: '',
  active: true,
}

export interface IWarehouse {
  id: number
  name: string
  organization_id: number
  active: boolean
  organization?: IOrganization
  createdAt?: string
  updatedAt?: string
}

export const defaultWarehouse: IWarehouse = {
  id: 0,
  name: '',
  organization_id: 0,
  active: true,
}

export interface IPaymentType {
  id: number
  name: string
  currency?: string
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export const defaultPaymentType: IPaymentType = {
  id: 0,
  name: '',
  currency: 'UZS',
  active: true,
}

export interface IOtherSource {
  id: number
  name: string
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export const defaultOtherSource: IOtherSource = {
  id: 0,
  name: '',
  active: true,
}

export interface ICostType {
  id: number
  name: string
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export const defaultCostType: ICostType = {
  id: 0,
  name: '',
  active: true,
}

export interface IUser {
  id: number
  username: string
  first_name?: string
  last_name?: string
  full_name?: string
  organization_id?: number
  active?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface IInvoiceItem {
  id?: number
  invoice_id?: number
  product_id: number
  quantity: number
  price: number
  discount_percentage?: number
  discount_amount?: number
  exchange_rate?: number
  product?: IProduct
}

export interface IInvoice {
  id?: number
  invoice_number?: string
  invoice_date?: string
  warehouse_id: number
  supplier_id?: number
  other_source_id?: number
  total_amount?: number
  description?: string
  user_id?: number
  warehouse?: IWarehouse
  supplier?: ISupplier
  otherSource?: IOtherSource
  user?: IUser
  products?: IInvoiceItem[]
  createdAt?: string
  updatedAt?: string
}

export const defaultInvoice: IInvoice = {
  invoice_date: new Date().toISOString().split('T')[0],
  warehouse_id: 0,
  supplier_id: undefined,
  other_source_id: undefined,
  description: '',
  items: [],
}

export const defaultInvoiceItem: IInvoiceItem = {
  product_id: 0,
  quantity: 1,
  price: 0,
  discount_percentage: 0,
  discount_amount: 0,
}
