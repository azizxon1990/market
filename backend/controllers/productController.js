const { Product } = require('../models');
const { Op } = require('sequelize');

const getAllProducts = async (req, res) => {
  try {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get search parameter
    const search = req.query.search;
    
    // Get status parameter
    const status = req.query.status;
    
    // Get category filter parameter
    const categoryId = req.query.categoryId;
    
    // Get sort parameters
    const sortField = req.query.sortField || 'id';
    const sortDirection = req.query.sortDirection || 'ASC';

    // Build where clause for search, status filter, and category filter
    let whereClause = {};
    
    if (search) {
      whereClause.name = { [Op.iLike]: `%${search}%` }; 
    }
    
    if (status === 'active') {
      whereClause.active = true;
    } else if (status === 'inactive') {
      whereClause.active = false;
    }
    
    if (categoryId) {
      whereClause.category_id = categoryId;
    }

    // Validate sort field to prevent SQL injection
    const allowedSortFields = ['id', 'name', 'unit', 'category_id', 'active', 'createdAt', 'updatedAt'];
    const validSortField = allowedSortFields.includes(sortField) ? sortField : 'id';
    const validSortDirection = ['ASC', 'DESC'].includes(sortDirection.toUpperCase()) ? sortDirection.toUpperCase() : 'ASC';

    // Get total count for pagination metadata
    const totalCount = await Product.count({ where: whereClause });
    
    // Fetch products with pagination, search, filtering, and sorting
    const products = await Product.findAll({
      where: whereClause,
      include: ['category'],
      limit: limit,
      offset: offset,
      order: [[validSortField, validSortDirection]]
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      data: products,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const createProduct = async (req, res) => {
  
  try {
    const {name, category_id, unit, description, active} = req.body;
    const newProduct = await Product.create({name, category_id, unit, description, active}, {
      include: ['category']
    });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, { include: ['category'] });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const updateProduct = async (req, res) => {
  try {
    const {name, category_id, unit, description, active} = req.body;
    const [updated] = await Product.update({
      name, category_id, unit, description, active
    }, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedProduct = await Product.findByPk(req.params.id, { include: ['category'] });
      res.json(updatedProduct);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getActiveProducts = async (req, res) => {
  try {
    const activeProducts = await Product.findAll({ 
      where: { active: true },
      include: ['category']
    });
    res.json(activeProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const searchActiveProducts = async (req, res) => {
  console.log('Search query:', req.query);
  
  try {
    const { query, category_id } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Qidiruv so\'zi talab qilinadi' });
    }
    const whereCondition = {
      active: true,
      name: {
        [Op.iLike]: `%${query}%`
      }
    };
    if (category_id) {
      whereCondition.category_id = category_id;
    }
    const products = await Product.findAll({
      where: whereCondition,
      include: ['category'],
      order: [['name', 'ASC']]
    });

    res.json({products});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  getActiveProducts,
  searchActiveProducts
};