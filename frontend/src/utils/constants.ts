/**
 * Application constants
 */

// Pagination constants
export const PAGINATION = {
  DEFAULT_ITEMS_PER_PAGE: 10,
  DEFAULT_PAGE: 1,
} as const

// Export individual constants for easier imports
export const DEFAULT_ITEMS_PER_PAGE = PAGINATION.DEFAULT_ITEMS_PER_PAGE
export const DEFAULT_PAGE = PAGINATION.DEFAULT_PAGE
