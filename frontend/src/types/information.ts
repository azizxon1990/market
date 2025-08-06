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
