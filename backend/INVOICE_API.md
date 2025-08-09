# Invoice API Documentation

## Overview

The Invoice API allows you to create, read, update, and delete invoices with their associated products. Each invoice must be associated with either a supplier or an other source, but not both.

## Models

### Invoice

- `id`: Primary key (auto-increment)
- `invoice_number`: Unique invoice number (auto-generated as INV-YYYYMMDD-XXXX)
- `invoice_date`: Date of the invoice
- `warehouse_id`: ID of the warehouse (required)
- `supplier_id`: ID of the supplier (optional, mutually exclusive with other_source_id)
- `other_source_id`: ID of the other source (optional, mutually exclusive with supplier_id)
- `total_amount`: Total amount of the invoice (calculated automatically)
- `description`: Optional description/commentary
- `user_id`: ID of the user who created the invoice

### InvoiceItem

- `id`: Primary key (auto-increment)
- `invoice_id`: ID of the parent invoice
- `product_id`: ID of the product
- `quantity`: Quantity of the product
- `price`: Price per unit
- `discount_percentage`: Discount percentage (optional)
- `discount_amount`: Discount amount (optional)
- `exchange_rate`: Exchange rate if applicable (optional)

## API Endpoints

### GET /invoices

Get all invoices with pagination, search, and filtering.

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search in invoice number or description
- `startDate`: Filter by start date (YYYY-MM-DD)
- `endDate`: Filter by end date (YYYY-MM-DD)
- `warehouseId`: Filter by warehouse ID
- `supplierId`: Filter by supplier ID
- `sortField`: Field to sort by (default: id)
- `sortDirection`: ASC or DESC (default: DESC)

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "invoice_number": "INV-20250807-0001",
      "invoice_date": "2025-08-07T10:00:00.000Z",
      "warehouse_id": 1,
      "supplier_id": 1,
      "other_source_id": null,
      "total_amount": "1500.00",
      "description": "Sample invoice",
      "user_id": 1,
      "warehouse": {
        "id": 1,
        "name": "Main Warehouse"
      },
      "supplier": {
        "id": 1,
        "name": "Supplier ABC"
      },
      "user": {
        "id": 1,
        "username": "admin",
        "full_name": "John",
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### POST /invoices

Create a new invoice with products.

**Request Body:**

```json
{
  "date": "2025-08-07",
  "warehouse_id": 1,
  "supplier_id": 1,
  "other_source_id": null,
  "commentary": "Sample invoice description",
  "products": [
    {
      "product_id": 1,
      "quantity": 10,
      "price": 100.00,
      "discount_percentage": 5.00,
      "discount_amount": 50.00,
      "exchange_rate": null
    },
    {
      "product_id": 2,
      "quantity": 5,
      "price": 200.00,
      "discount_percentage": 0,
      "discount_amount": 0,
      "exchange_rate": null
    }
  ]
}
```

**Validation Rules:**

- `date`: Required, must be valid ISO 8601 date
- `warehouse_id`: Required, must be valid warehouse ID
- `supplier_id` OR `other_source_id`: One must be provided, but not both
- `products`: Required array with at least one product
- `products[].product_id`: Required, must be valid product ID
- `products[].quantity`: Required, must be greater than 0
- `products[].price`: Required, must be non-negative decimal
- `commentary`: Optional, max 1000 characters

**Response:**

```json
{
  "message": "Invoice muvaffaqiyatli yaratildi",
  "data": {
    "id": 1,
    "invoice_number": "INV-20250807-0001",
    "invoice_date": "2025-08-07T10:00:00.000Z",
    "warehouse_id": 1,
    "supplier_id": 1,
    "other_source_id": null,
    "total_amount": "1450.00",
    "description": "Sample invoice description",
    "user_id": 1,
    "warehouse": {
      "id": 1,
      "name": "Main Warehouse"
    },
    "supplier": {
      "id": 1,
      "name": "Supplier ABC"
    },
    "user": {
      "id": 1,
      "username": "admin",
      "full_name": "Doe"
    },
    "items": [
      {
        "id": 1,
        "invoice_id": 1,
        "product_id": 1,
        "quantity": "10.000",
        "price": "100.00",
        "discount_percentage": "5.00",
        "discount_amount": "50.00",
        "exchange_rate": null,
        "product": {
          "id": 1,
          "name": "Product A",
          "unit": "pcs"
        }
      }
    ]
  }
}
```

### GET /invoices/:id

Get a specific invoice by ID.

**Response:**

```json
{
  "id": 1,
  "invoice_number": "INV-20250807-0001",
  "invoice_date": "2025-08-07T10:00:00.000Z",
  "warehouse_id": 1,
  "supplier_id": 1,
  "other_source_id": null,
  "total_amount": "1450.00",
  "description": "Sample invoice description",
  "user_id": 1,
  "warehouse": {
    "id": 1,
    "name": "Main Warehouse"
  },
  "supplier": {
    "id": 1,
    "name": "Supplier ABC"
  },
  "user": {
    "id": 1,
    "username": "admin",
    "full_name": "John",
  },
  "items": [
    {
      "id": 1,
      "invoice_id": 1,
      "product_id": 1,
      "quantity": "10.000",
      "price": "100.00",
      "discount_percentage": "5.00",
      "discount_amount": "50.00",
      "exchange_rate": null,
      "product": {
        "id": 1,
        "name": "Product A",
        "unit": "pcs"
      }
    }
  ]
}
```

### PUT /invoices/:id

Update an existing invoice.

**Request Body:** Same as POST /invoices

**Response:**

```json
{
  "message": "Invoice muvaffaqiyatli yangilandi",
  "data": {
    // Updated invoice data with same structure as GET response
  }
}
```

### DELETE /invoices/:id

Delete an invoice and its associated items.

**Response:**

```json
{
  "message": "Invoice muvaffaqiyatli o'chirildi"
}
```

## Features

1. **Automatic Invoice Number Generation**: Invoice numbers are automatically generated in the format `INV-YYYYMMDD-XXXX`
2. **Total Calculation**: Invoice totals are automatically calculated from the products
3. **Transaction Support**: All database operations use transactions to ensure data consistency
4. **Validation**: Comprehensive validation for all input data
5. **Pagination**: Support for paginated results with metadata
6. **Search and Filtering**: Search by invoice number/description and filter by various criteria
7. **Associations**: Full support for related data (warehouse, supplier, user, products)

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `500`: Internal Server Error

Error responses include descriptive messages in JSON format:

```json
{
  "error": "Error message here",
  "details": [
    // Validation error details if applicable
  ]
}
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```
