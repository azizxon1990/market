const { PaymentType, PaymentTypeOrganization } = require('../models');

const getAllPaymentTypes = async (req, res) => {
    try {
        const paymentTypes = await PaymentType.findAll();
        res.json(paymentTypes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    }

const createPaymentType = async (req, res) => {
    try {
        const {name, active, currency} = req.body;
        const newPaymentType = await PaymentType.create({name, active, currency});
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
        const {name, active, currency} = req.body;
        const [updated] = await PaymentType.update({
            name, active, currency
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

