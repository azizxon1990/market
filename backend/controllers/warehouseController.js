const {  Warehouse } = require('../models');

const getAllWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.findAll({ include: 'organization' });
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const createWarehouse = async (req, res) => {
  try {
    const {name, organization_id, active} = req.body;
    const newWarehouse = await Warehouse.create({name, organization_id, active}, {
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
    const {name, organization_id, active} = req.body;
    const [updated] = await Warehouse.update({
      name, organization_id, active
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