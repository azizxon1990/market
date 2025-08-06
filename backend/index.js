const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const routes = require('./routes/index');

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS
app.use(cors());

// Apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

app.use(limiter);
app.use(bodyParser.json());

// Routes
app.use('/auth', routes.authRoutes);
app.use('/users', routes.userRoutes);
app.use('/categories', routes.categoryRoutes);
app.use('/products', routes.productRoutes);
app.use('/organizations', routes.organizationRoutes);
app.use('/suppliers', routes.supplierRoutes);
app.use('/warehouses', routes.warehouseRoutes);
app.use('/cost-types', routes.costTypeRoutes);
app.use('/payment-types', routes.paymentTypeRoutes);
app.use('/other-sources', routes.otherSourceRoutes);




// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
