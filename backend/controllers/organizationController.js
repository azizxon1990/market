const { Organization } = require('../models');
const { Op } = require('sequelize');

const getAllOrganizations = async (req, res) => {
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
    const totalCount = await Organization.count({ where: whereClause });
    
    // Fetch organizations with pagination, search, and sorting
    const organizations = await Organization.findAll({
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
      data: organizations,
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

const createOrganization = async (req, res) => {
  try {
    const { name, active = true } = req.body;
    
    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Organization name is required' });
    }
    
    const newOrganization = await Organization.create({ 
      name: name.trim(), 
      active 
    });
    
    res.status(201).json(newOrganization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getOrganizationById = async (req, res) => {
  try {
    const organization = await Organization.findByPk(req.params.id);
    if (organization) {
      res.json(organization);
    } else {
      res.status(404).json({ error: 'Organization not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const updateOrganization = async (req, res) => {
  try {
    const { name, active } = req.body;
    
    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Organization name is required' });
    }
    
    const [updated] = await Organization.update({
      name: name.trim(), 
      active
    }, {
      where: { id: req.params.id }
    });
    
    if (updated) {
      const updatedOrganization = await Organization.findByPk(req.params.id);
      res.json(updatedOrganization);
    } else {
      res.status(404).json({ error: 'Organization not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getActiveOrganizations = async (req, res) => {
  try {
    const activeOrganizations = await Organization.findAll({ where: { active: true } });
    res.json(activeOrganizations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getAllOrganizations,
  createOrganization,
  getOrganizationById,
  updateOrganization,
  getActiveOrganizations
};