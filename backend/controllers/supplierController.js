const { Supplier } = require('../models');
const { Op } = require('sequelize');

const getAllSuppliers = async (req, res) => {
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
    const allowedSortFields = ['id', 'name', 'phone_number', 'active', 'createdAt', 'updatedAt'];
    const validSortField = allowedSortFields.includes(sortField) ? sortField : 'id';
    const validSortDirection = ['ASC', 'DESC'].includes(sortDirection.toUpperCase()) ? sortDirection.toUpperCase() : 'ASC';

    // Get total count for pagination metadata
    const totalCount = await Supplier.count({ where: whereClause });
    
    // Fetch suppliers with pagination, search, and sorting
    const suppliers = await Supplier.findAll({
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
      data: suppliers,
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

const createSupplier = async (req, res) => {
  try {
    const { name, phone_number, active = true } = req.body;
    
    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Supplier name is required' });
    }
    
    const newSupplier = await Supplier.create({ 
      name: name.trim(), 
      phone_number,
      active 
    });
    
    res.status(201).json(newSupplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (supplier) {
      res.json(supplier);
    } else {
      res.status(404).json({ error: 'Supplier not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const updateSupplier = async (req, res) => {
  try {
    const { name, phone_number, active } = req.body;
    
    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Supplier name is required' });
    }
    
    const [updated] = await Supplier.update({
      name: name.trim(), 
      phone_number, 
      active
    }, {
      where: { id: req.params.id }
    });
    
    if (updated) {
      const updatedSupplier = await Supplier.findByPk(req.params.id);
      res.json(updatedSupplier);
    } else {
      res.status(404).json({ error: 'Supplier not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getActiveSuppliers = async (req, res) => {
  try {
    const activeSuppliers = await Supplier.findAll({ where: { active: true } });
    res.json(activeSuppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getAllSuppliers,
  createSupplier,
  getSupplierById,
  updateSupplier,
  getActiveSuppliers
};