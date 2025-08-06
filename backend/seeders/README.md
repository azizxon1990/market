# Database Seeders

This directory contains seeders for the supermarket backend application.

## Seeder Files

### 1. Organizations Seeder (`20250127100000-demo-organizations.js`)

Creates 5 demo organizations:

- Main Office
- Branch Office 1  
- Branch Office 2
- Warehouse Department
- Sales Department

### 2. Users Seeder (`20250127100001-demo-users.js`)

Creates 5 demo users with hashed passwords:

| Username | Password | First Name | Organization | Active |
|----------|----------|------------|--------------|--------|
| admin | admin123 | System Administrator | Main Office | true |
| manager | manager123 | Manager User | Main Office | true |
| user | user123 | Regular User | Branch Office 1 | true |
| warehouse_user | warehouse123 | Warehouse Manager | Warehouse Department | true |
| sales_user | sales123 | Sales Representative | Sales Department | true |

## Running Seeders

### Run all seeders

```bash
npm run seed
```

### Undo all seeders

```bash
npm run seed:undo
```

### Undo last seeder

```bash
npm run seed:undo:one
```

### Manual commands

```bash
# Run all seeders
npx sequelize-cli db:seed:all

# Run specific seeder
npx sequelize-cli db:seed --seed 20250127100000-demo-organizations.js

# Undo all seeders
npx sequelize-cli db:seed:undo:all

# Undo specific seeder
npx sequelize-cli db:seed:undo --seed 20250127100001-demo-users.js
```

## Prerequisites

Make sure you have:

1. Run database migrations: `npm run migrate`
2. Configured your database connection in `config/config.json`

## Notes

- Passwords are hashed using bcryptjs with salt rounds = 10
- Organizations are created first to satisfy foreign key constraints in users table
- All users are created as active by default
- User IDs and Organization IDs are explicitly set for consistency
