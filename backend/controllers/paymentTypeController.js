const { PaymentType, PaymentTypeOrganization } = require('../models');
const { Op } = require('sequelize');

const getAllPaymentTypes = async (req, res) => {
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
        const allowedSortFields = ['id', 'name', 'currency', 'active'];
        const validSortField = allowedSortFields.includes(sortField) ? sortField : 'id';
        const validSortDirection = ['ASC', 'DESC'].includes(sortDirection.toUpperCase()) ? sortDirection.toUpperCase() : 'ASC';

        // Get total count for pagination metadata
        const totalCount = await PaymentType.count({ where: whereClause });
        
        // Fetch payment types with pagination, search, and sorting
        const paymentTypes = await PaymentType.findAll({
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
            data: paymentTypes,
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

const createPaymentType = async (req, res) => {
    try {
        const { name, active = true, currency } = req.body;
        
        // Validation
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Payment type name is required' });
        }
        
        const newPaymentType = await PaymentType.create({ 
            name: name.trim(), 
            active, 
            currency 
        });
        
        res.status(201).json(newPaymentType);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getPaymentTypeById = async (req, res) => {
    try {
        const paymentType = await PaymentType.findByPk(req.params.id);
        if (paymentType) {
            res.json(paymentType);
        } else {
            res.status(404).json({ error: 'Payment Type not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updatePaymentType = async (req, res) => {
    try {
        const { name, active, currency } = req.body;
        
        // Validation
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Payment type name is required' });
        }
        
        const [updated] = await PaymentType.update({
            name: name.trim(), 
            active, 
            currency
        }, {
            where: { id: req.params.id }
        });
        
        if (updated) {
            const updatedPaymentType = await PaymentType.findByPk(req.params.id);
            res.json(updatedPaymentType);
        } else {
            res.status(404).json({ error: 'Payment Type not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


const addOrDeletePaymentTypeOrganization  = async (req, res) => {
    const payment_type_id = req.params.id;
    const {organization_ids} = req.body.organization_ids;
    try {
        await PaymentTypeOrganization.destroy({ where: { payment_type_id, organization_id: { [Op.notIn]: organization_ids } } });
        await PaymentTypeOrganization.bulkCreate(organization_ids.map(organization_id => ({ payment_type_id, organization_id })));
        res.json({ message: 'Payment Type Organizations updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getActivePaymentTypesByUserOrganizationId = async (req, res) => {
    try {
        const userOrganizationId = req.user.organization_id;
        const activePaymentTypes = await PaymentType.findAll({
            include: [
                {
                    model: PaymentTypeOrganization,
                    where: { organization_id: userOrganizationId }
                }
            ]
        });
        res.json(activePaymentTypes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


module.exports = {
    getAllPaymentTypes,
    createPaymentType,
    getPaymentTypeById,
    updatePaymentType,
    addOrDeletePaymentTypeOrganization,
    getActivePaymentTypesByUserOrganizationId
}

