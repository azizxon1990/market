# Supermarket API Postman Collection v2.0

This directory contains the complete Postman collection and environment files for testing the Supermarket Backend API.

## Files

- `supermarket-collection.json` - Main Postman collection with all API endpoints
- `supermarket-environment.json` - Environment template with variables

## Features

### 🔐 Authentication
- Login with automatic token storage
- Logout with token cleanup
- Token validation tests

### 👥 User Management
- CRUD operations for users
- Password security validation
- User listing and filtering

### 📂 Categories
- Hierarchical category management
- Active/inactive status filtering
- Category relationship handling

### 📦 Products
- Complete product management
- Category-based filtering
- Product search functionality
- Active product filtering

### 🏢 Organizations
- Organization hierarchy management
- Multi-level organization support
- Active organization filtering

### 🚚 Suppliers
- Supplier information management
- Contact details handling
- Active supplier filtering

### 🏪 Warehouses
- Warehouse management per organization
- Location and address tracking
- Organization-based filtering

### 💰 Cost Types
- Cost categorization system
- Hierarchical cost structure
- Organization association management

### 💳 Payment Types
- Payment method management
- Organization-specific payment types
- Payment type status management

### 🔗 Other Sources
- Alternative source management
- Source status tracking

## Setup Instructions

### 1. Import Collection
1. Open Postman
2. Click "Import" button
3. Select `supermarket-collection.json`
4. Collection will be imported with all endpoints

### 2. Import Environment
1. In Postman, go to Environments
2. Click "Import"
3. Select `supermarket-environment.json`
4. Set as active environment

### 3. Configuration
Update the environment variables as needed:
- `base_url`: Your API server URL (default: http://localhost:3000)
- Other variables are auto-populated during testing

## Usage Guide

### Starting Your Testing Session

1. **Login First**: Always start by running the "Login" request from the Authentication folder
   - This will automatically store your JWT token
   - All subsequent requests will use this token

2. **Create Test Data**: Use the "Create" requests to generate test data
   - IDs are automatically stored in collection variables
   - Other requests can reference these IDs

3. **Run Tests**: Each request includes comprehensive tests
   - Status code validation
   - Response structure validation
   - Data integrity checks

### Environment Variables

The collection uses these key variables:

- `base_url` - API server base URL
- `token` - JWT authentication token (auto-managed)
- `test_*_id` - Auto-populated IDs for created resources

### Testing Features

#### Automatic Token Management
- Login request saves token automatically
- Logout request clears token
- All protected endpoints use the saved token

#### Smart Test Scripts
- Response time validation (< 2000ms)
- JSON format validation
- Status code verification
- Data structure validation
- Security checks (password exclusion)

#### Dynamic Data Generation
- Random data generation using `{{$randomInt}}`
- Unique usernames and names
- Realistic test data

## API Endpoints Overview

### Authentication
- `POST /auth/login` - User authentication
- `POST /auth/logout` - User logout

### Users
- `GET /users` - List all users
- `POST /users` - Create new user
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user

### Categories
- `GET /categories` - List all categories
- `POST /categories` - Create new category
- `GET /categories/:id` - Get category by ID
- `PUT /categories/:id` - Update category

### Products
- `GET /products` - List all products
- `POST /products` - Create new product
- `GET /products/:id` - Get product by ID
- `PUT /products/:id` - Update product
- `GET /products/active` - Get active products
- `GET /products/search` - Search products

### Organizations
- `GET /organizations` - List all organizations
- `POST /organizations` - Create new organization
- `GET /organizations/:id` - Get organization by ID
- `PUT /organizations/:id` - Update organization
- `GET /organizations/active` - Get active organizations

### Suppliers
- `GET /suppliers` - List all suppliers
- `POST /suppliers` - Create new supplier
- `GET /suppliers/:id` - Get supplier by ID
- `PUT /suppliers/:id` - Update supplier
- `GET /suppliers/active` - Get active suppliers

### Warehouses
- `GET /warehouses` - List all warehouses
- `POST /warehouses` - Create new warehouse
- `GET /warehouses/:id` - Get warehouse by ID
- `PUT /warehouses/:id` - Update warehouse
- `GET /warehouses/organization/:id` - Get warehouses by organization

### Cost Types
- `GET /cost-types` - List all cost types
- `POST /cost-types` - Create new cost type
- `GET /cost-types/:id` - Get cost type by ID
- `PUT /cost-types/:id` - Update cost type
- `GET /cost-types/active` - Get active cost types
- `PUT /cost-types/:id/organizations` - Update cost type organizations

### Payment Types
- `GET /payment-types` - List all payment types
- `POST /payment-types` - Create new payment type
- `GET /payment-types/:id` - Get payment type by ID
- `PUT /payment-types/:id` - Update payment type
- `GET /payment-types/active` - Get active payment types
- `PUT /payment-types/:id/organizations` - Update payment type organizations

### Other Sources
- `GET /other-sources` - List all other sources
- `POST /other-sources` - Create new other source
- `GET /other-sources/:id` - Get other source by ID
- `PUT /other-sources/:id` - Update other source

## Best Practices

### Testing Workflow
1. Start with Authentication (Login)
2. Create required test data
3. Test CRUD operations
4. Test filtering and search
5. Test relationships and associations
6. End with cleanup (optional)

### Error Handling
- Each request includes proper error handling
- Validation for required fields
- Status code verification
- Response structure validation

### Security
- Automatic token management
- Password field exclusion validation
- Authorization header management
- Rate limiting consideration

## Troubleshooting

### Common Issues

1. **Token Issues**
   - Ensure you've logged in first
   - Check if token has expired (1 hour validity)
   - Re-login if needed

2. **Connection Issues**
   - Verify `base_url` in environment
   - Ensure API server is running
   - Check firewall/proxy settings

3. **Data Issues**
   - Ensure required test data exists
   - Check foreign key relationships
   - Verify data formats

### Support
For issues with the API or collection, please check:
- API server logs
- Postman console for detailed error messages
- Network connectivity
- Environment variable settings

---

*Last updated: July 27, 2025*
*Collection version: 2.0*
