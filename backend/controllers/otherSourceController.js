const { OtherSource } = require('../models');
const { Op } = require('sequelize');

const getAllOtherSources = async (req, res) => {
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
        const totalCount = await OtherSource.count({ where: whereClause });
        
        // Fetch other sources with pagination, search, and sorting
        const otherSources = await OtherSource.findAll({
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
            data: otherSources,
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

const createOtherSource = async (req, res) => {
    try {
        const { name, active = true } = req.body;
        
        // Validation
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Other source name is required' });
        }
        
        const newOtherSource = await OtherSource.create({ 
            name: name.trim(), 
            active 
        });
        
        res.status(201).json(newOtherSource);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getOtherSourceById = async (req, res) => {
    try {
        const otherSource = await OtherSource.findByPk(req.params.id);
        if (otherSource) {
            res.json(otherSource);
        } else {
            res.status(404).json({ error: 'Other Source not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateOtherSource = async (req, res) => {
    try {
        const { name, active } = req.body;
        
        // Validation
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Other source name is required' });
        }
        
        const [updated] = await OtherSource.update({
            name: name.trim(), 
            active
        }, {
            where: { id: req.params.id }
        });
        
        if (updated) {
            const updatedOtherSource = await OtherSource.findByPk(req.params.id);
            res.json(updatedOtherSource);
        } else {
            res.status(404).json({ error: 'Other Source not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getActiveOtherSources = async (req, res) => {
    try {
        const activeOtherSources = await OtherSource.findAll({ where: { active: true } });
        res.json(activeOtherSources);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAllOtherSources,
    createOtherSource,
    getOtherSourceById,
    updateOtherSource,
    getActiveOtherSources
}
