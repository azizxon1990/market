const { Warehouse } = require('../models');
const { Op } = require('sequelize');

const getAllWarehouses = async (req, res) => {
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
    const allowedSortFields = ['id', 'name', 'organization_id', 'active', 'createdAt', 'updatedAt'];
    const validSortField = allowedSortFields.includes(sortField) ? sortField : 'id';
    const validSortDirection = ['ASC', 'DESC'].includes(sortDirection.toUpperCase()) ? sortDirection.toUpperCase() : 'ASC';

    // Get total count for pagination metadata
    const totalCount = await Warehouse.count({ where: whereClause });
    
    // Fetch warehouses with pagination, search, and sorting
    const warehouses = await Warehouse.findAll({
      where: whereClause,
      limit: limit,
      offset: offset,
      order: [[validSortField, validSortDirection]],
      include: 'organization'
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      data: warehouses,
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

const createWarehouse = async (req, res) => {
  try {
    const { name, organization_id, active = true } = req.body;
    
    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Warehouse name is required' });
    }
    
    const newWarehouse = await Warehouse.create({ 
      name: name.trim(), 
      organization_id, 
      active 
    }, {
      include: 'organization'
    });
    
    res.status(201).json(newWarehouse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getWarehouseById = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByPk(req.params.id, { include: 'organization' });
    if (warehouse) {
      res.json(warehouse);
    } else {
      res.status(404).json({ error: 'Warehouse not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const updateWarehouse = async (req, res) => {
  try {
    const { name, organization_id, active } = req.body;
    
    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Warehouse name is required' });
    }
    
    const [updated] = await Warehouse.update({
      name: name.trim(), 
      organization_id, 
      active
    }, {
      where: { id: req.params.id }
    });
    
    if (updated) {
      const updatedWarehouse = await Warehouse.findByPk(req.params.id, { include: 'organization' });
      res.json(updatedWarehouse);
    } else {
      res.status(404).json({ error: 'Warehouse not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getActiveWarehousesByOrganizationId = async (req, res) => {
    try {
        const activeWarehouses = await Warehouse.findAll({ where: { active: true, organization_id: req.params.id } });
        res.json(activeWarehouses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


module.exports = {
  getAllWarehouses,
  createWarehouse,
  getWarehouseById,
  updateWarehouse,
  getActiveWarehousesByOrganizationId
};