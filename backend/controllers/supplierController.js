const { Supplier } = require('../models');

const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const createSupplier = async (req, res) => {
  
  try {
    const {name, phone_number, active} = req.body;
    const newSupplier = await Supplier.create({name, phone_number, active});
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
    const {name, phone_number, active} = req.body;
    const [updated] = await Supplier.update({
      name, phone_number, active
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