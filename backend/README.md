# Supermarket Management System

A full-stack supermarket management system with a REST API backend and an Electron.js desktop application frontend.

## 🚀 Features

### Backend (REST API)
- **Authentication & Authorization**: JWT-based user authentication
- **Product Management**: CRUD operations for products and categories
- **Supplier Management**: Manage supplier information and relationships
- **Warehouse Management**: Track multiple warehouse locations
- **Invoice System**: Create and manage sales invoices
- **Organization Management**: Multi-organization support
- **User Management**: Role-based user accounts
- **Cost & Payment Types**: Configurable cost and payment types
- **Database**: PostgreSQL with Sequelize ORM

### Frontend (Desktop App)
- **Modern UI**: Clean, responsive interface with Tailwind CSS
- **Real-time Dashboard**: Overview of key business metrics
- **Cross-platform**: Works on Windows, macOS, and Linux
- **Offline Capable**: Local data caching and sync
- **Native Desktop**: Full Electron.js desktop application
- **Live Updates**: Real-time data synchronization

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT + bcryptjs
- **Validation**: express-validator
- **Security**: CORS, Rate limiting

### Frontend
- **Desktop Framework**: Electron.js
- **Styling**: Tailwind CSS
- **Icons**: Lucide Icons
- **HTTP Client**: Fetch API
- **Build Tool**: Native CSS processing

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd supermarket
```

### 2. Setup Backend
```bash
# Install backend dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Setup Database
```bash
# Run database migrations
npm run migrate

# Optional: Run seeders
npx sequelize-cli db:seed:all
```

### 4. Setup Frontend
```bash
# Install frontend dependencies
cd frontend
npm install

# Build CSS assets
npm run build:css

# Return to root directory
cd ..
```

### 5. Start the Application

#### Option A: Start Everything at Once
```bash
# Install concurrently if not already installed
npm install -g concurrently

# Start both backend and frontend
npm run fullstack
```

#### Option B: Start Services Separately

**Terminal 1 (Backend):**
```bash
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run frontend:dev
```

#### Option C: Use Startup Scripts

**macOS/Linux:**
```bash
./start.sh
```

**Windows:**
```bash
start.bat
```

## 📁 Project Structure

```
supermarket/
├── 📁 backend files (root)
│   ├── index.js              # Express server entry point
│   ├── package.json          # Backend dependencies
│   ├── config/               # Configuration files
│   ├── controllers/          # API controllers
│   ├── middleware/           # Express middleware
│   ├── models/               # Sequelize models
│   ├── routes/               # API routes
│   ├── migrations/           # Database migrations
│   └── seeders/              # Database seeders
│
├── 📁 frontend/              # Electron desktop app
│   ├── main.js               # Electron main process
│   ├── package.json          # Frontend dependencies
│   ├── tailwind.config.js    # Tailwind configuration
│   ├── public/               # Static assets
│   │   ├── index.html        # Main HTML file
│   │   └── styles/           # Compiled CSS
│   └── src/                  # Source code
│       ├── app.js            # Main app controller
│       ├── components/       # Feature components
│       ├── utils/            # Utility modules
│       └── styles/           # CSS source files
│
├── start.sh                  # macOS/Linux startup script
├── start.bat                 # Windows startup script
└── README.md                 # This file
```

## 🔧 Configuration

### Backend Configuration (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=supermarket
DB_USER=your_username
DB_PASS=your_password

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=development
```

### Frontend Configuration
Update API base URL in `frontend/src/utils/api.js`:
```javascript
this.baseURL = 'http://localhost:3000';
```

## 📊 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Products
- `GET /products` - Get all products
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Categories
- `GET /categories` - Get all categories
- `POST /categories` - Create category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

### Suppliers
- `GET /suppliers` - Get all suppliers
- `POST /suppliers` - Create supplier
- `PUT /suppliers/:id` - Update supplier
- `DELETE /suppliers/:id` - Delete supplier

*(And more...)*

## 🖥 Desktop App Features

### Dashboard
- Key performance indicators
- Recent activity overview
- Quick action buttons
- Stock alerts and notifications

### Product Management
- Add, edit, delete products
- Category filtering and search
- Stock level tracking
- Bulk import/export capabilities

### Supplier Management
- Contact information management
- Supplier relationship tracking
- Communication history

## 🔒 Authentication

Default credentials for development:
- **Email**: `admin@example.com`
- **Password**: `password123`

## 🚀 Building for Production

### Backend
```bash
npm run start
```

### Frontend (Desktop App)
```bash
cd frontend

# Build CSS
npm run build:css

# Package for current platform
npm run pack

# Create distributable for all platforms
npm run dist
```

## 🧪 Testing

```bash
# Backend tests
npm test

# Frontend tests
cd frontend
npm test
```

## 📱 Scripts Reference

### Root Package Scripts
- `npm run setup` - Install all dependencies
- `npm run dev` - Start backend in development mode
- `npm run start` - Start backend in production mode
- `npm run migrate` - Run database migrations
- `npm run frontend` - Start desktop app
- `npm run frontend:dev` - Start desktop app in development mode
- `npm run fullstack` - Start both backend and frontend

### Frontend Package Scripts
- `npm start` - Start Electron app
- `npm run dev` - Start with CSS watching
- `npm run build:css` - Build CSS assets
- `npm run pack` - Package app for current platform
- `npm run dist` - Create distributable packages

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **Frontend Not Loading**
   - Run `npm run build:css` in frontend directory
   - Check backend API is running on port 3000
   - Verify API URL in `frontend/src/utils/api.js`

3. **Authentication Issues**
   - Check JWT secret in `.env`
   - Verify user credentials
   - Clear browser/app storage

### Development Mode
For debugging, open Developer Tools in the desktop app:
- Menu: View → Toggle Developer Tools
- Keyboard: `F12` or `Cmd/Ctrl + Shift + I`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
1. Check the troubleshooting section above
2. Review API documentation
3. Open an issue on GitHub
4. Contact the development team

---

**Happy coding! 🎉**
