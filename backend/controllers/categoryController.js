const { Category } = require('../models');
    const { Op } = require('sequelize');


const getAllCategories = async (req, res) => {
  try {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Get search parameter
    const search = req.query.search;
    
    // Get status parameter
    const status = req.query.status;
    
    // Get sort parameters
    const sortField = req.query.sortField || 'id';
    const sortDirection = req.query.sortDirection || 'ASC';

    // Build where clause for search and status filter
    let whereClause = {};
    
    if (search) {
      whereClause.name = { [Op.iLike]: `%${search}%` }; 
    }
    
    if (status === 'active') {
      whereClause.active = true;
    } else if (status === 'inactive') {
      whereClause.active = false;
    }

    // Validate sort field to prevent SQL injection
    const allowedSortFields = ['id', 'name', 'active', 'createdAt', 'updatedAt'];
    const validSortField = allowedSortFields.includes(sortField) ? sortField : 'id';
    const validSortDirection = ['ASC', 'DESC'].includes(sortDirection.toUpperCase()) ? sortDirection.toUpperCase() : 'ASC';

    // Get total count for pagination metadata
    const totalCount = await Category.count({ where: whereClause });
    
    // Fetch categories with pagination, search, and sorting
    const categories = await Category.findAll({
      where: whereClause,
      limit: limit,
      offset: offset,
      order: [[validSortField, validSortDirection]]
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      data: categories,
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
};

const createCategory = async (req, res) => {
  try {
    const { name, active = true } = req.body;
    
    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    const newCategory = await Category.create({ 
      name: name.trim(), 
      active 
    });
    
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, active } = req.body;
    
    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    const [updated] = await Category.update({
      name: name.trim(), 
      active
    }, {
      where: { id: req.params.id }
    });
    
    if (updated) {
      const updatedCategory = await Category.findByPk(req.params.id);
      res.json(updatedCategory);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getActiveCategories = async (req, res) => {
  try {
    const activeCategories = await Category.findAll({ where: { active: true } });
    res.json(activeCategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




module.exports = {
  getAllCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  getActiveCategories
};
