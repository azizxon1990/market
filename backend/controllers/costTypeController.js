const { CostType, CostTypeOrganization } = require('../models');
const { Op } = require('sequelize');

const getAllCostTypes = async (req, res) => {
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
    const totalCount = await CostType.count({ where: whereClause });
    
    // Fetch cost types with pagination, search, and sorting
    const costTypes = await CostType.findAll({
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
      data: costTypes,
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

const createCostType = async (req, res) => {
  try {
    const { name, active = true } = req.body;
    
    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Cost type name is required' });
    }
    
    const newCostType = await CostType.create({ 
      name: name.trim(), 
      active 
    });
    
    res.status(201).json(newCostType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getCostTypeById = async (req, res) => {
  try {
    const costType = await CostType.findByPk(req.params.id);
    if (costType) {
      res.json(costType);
    } else {
      res.status(404).json({ error: 'Cost Type not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const updateCostType = async (req, res) => {
  try {
    const { name, active } = req.body;
    
    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Cost type name is required' });
    }
    
    const [updated] = await CostType.update({
      name: name.trim(), 
      active
    }, {
      where: { id: req.params.id }
    });
    
    if (updated) {
      const updatedCostType = await CostType.findByPk(req.params.id);
      res.json(updatedCostType);
    } else {
      res.status(404).json({ error: 'Cost Type not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const addOrDeleteCostTypeOrganization  = async (req, res) => {
    const cost_type_id = req.params.id;
    const {organization_ids} = req.body.organization_ids;
    try {
        await CostTypeOrganization.destroy({ where: { cost_type_id, organization_id: { [Op.notIn]: organization_ids } } });
        await CostTypeOrganization.bulkCreate(organization_ids.map(organization_id => ({ cost_type_id, organization_id })));
        res.json({ message: 'Cost Type Organizations updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
} 

const getActiveCostTypesByUserOrganizationId = async (req, res) => {
  try {
    const userOrganizationId = req.user.organization_id;
    const activeCostTypes = await CostType.findAll({
        include: [
          {
            model: CostTypeOrganization,
            where: { organization_id: userOrganizationId }
          }
        ]
      });
    res.json(activeCostTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}



module.exports = {
  getAllCostTypes,
  createCostType,
  getCostTypeById,
  updateCostType,
  addOrDeleteCostTypeOrganization,
  getActiveCostTypesByUserOrganizationId
};